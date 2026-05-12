import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const scheduleId = searchParams.get('schedule_id')

    if (!scheduleId) {
        return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    try {
        const dataUpload = await prisma.dataUpload.findFirst({
            where: { schedule_id: scheduleId },
            orderBy: { uploaded_at: 'desc' }
        })

        if (!dataUpload) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        return NextResponse.json({
            filename: dataUpload.filename,
            schedule_id: dataUpload.schedule_id,
            uploaded_at: dataUpload.uploaded_at
        })
    } catch (error) {
        console.error('Download error:', error)
        return NextResponse.json({ error: 'Failed to fetch file info' }, { status: 500 })
    }
}