import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userWithRole = session?.user as { id: number, role: string, employee_id: number }
    if (userWithRole.role === 'VIEWER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
        for (const scheduleId of scheduleIds) {
            await prisma.dataUpload.create({
                data: {
                    filename: file.name,
                    schedule_id: scheduleId,
                    uploaded_by: parseInt(userWithRole.id.toString())
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

    const uploads = await prisma.dataUpload.findMany({
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
