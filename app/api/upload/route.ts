import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = session.user as any
    const formData = await req.formData()
    const file = formData.get('file') as File
    const scheduleIdsStr = formData.get('schedule_ids') as string
    
    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    const scheduleIds = scheduleIdsStr ? JSON.parse(scheduleIdsStr) : []
    if (!scheduleIds || scheduleIds.length === 0) {
        return NextResponse.json({ error: 'No schedule selected' }, { status: 400 })
    }

    try {
        // Ownership check for non-privileged users
        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
            const ownedSchedules = await prisma.schedule.count({
                where: {
                    id: { in: scheduleIds },
                    employee_id: parseInt(user.employee_id.toString())
                }
            })

            if (ownedSchedules !== scheduleIds.length) {
                return NextResponse.json({ error: 'Forbidden: You can only upload reports for your own schedules' }, { status: 403 })
            }
        }

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Convert file to buffer and save with unique name
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uniqueFilename = `${Date.now()}-${file.name}`
        const filePath = path.join(uploadsDir, uniqueFilename)
        await writeFile(filePath, buffer)

        for (const scheduleId of scheduleIds) {
            await prisma.dataUpload.create({
                data: {
                    filename: uniqueFilename,
                    schedule_id: scheduleId,
                    uploaded_by: parseInt(user.id.toString())
                },
            })

            await prisma.schedule.update({
                where: { id: scheduleId },
                data: { reported: 1 }
            })
        }

        return NextResponse.json({
            success: true,
            uploadCount: scheduleIds.length
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to process upload', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const where: any = {}

    // Filter by owner if not ADMIN or EDITOR
    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
        where.uploaded_by = parseInt(user.id.toString())
    }

    const uploads = await prisma.dataUpload.findMany({
        where,
        include: {
            schedule: {
                include: {
                    employee: true
                }
            }
        },
        orderBy: { uploaded_at: 'desc' },
        take: 20,
    })

    return NextResponse.json(uploads)
}
