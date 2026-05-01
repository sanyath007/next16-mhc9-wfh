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
    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    try {
        /** Create upload record */
        const upload = await prisma.dataUpload.create({
            data: {
                filename: file.name,
                work_date: new Date(formData.get('work_date') as string),
                employee_id: userWithRole.employee_id,
                year: 2026,
                uploaded_by: userWithRole.id
            },
        })

        return NextResponse.json({
            success: true,
            uploadId: upload.id
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
        orderBy: { uploaded_at: 'desc' },
        take: 20,
    })

    return NextResponse.json(uploads)
}
