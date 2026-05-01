import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userWithRole = session?.user as { id: number, role: string }
    if (userWithRole.role === 'VIEWER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { work_date, employee_id } = await req.json()
    try {
        /** Create upload record */
        const upload = await prisma.schedule.create({
            data: {
                work_date: new Date(work_date),
                employee_id,
                report_file: '',
                created_by: userWithRole.id
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

export async function GET(req: NextRequest) {
    const session = await auth()

    /** Get query params */
    const searchParams = req.nextUrl.searchParams
    const date = searchParams.get("date")

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schedules = await prisma.schedule.findMany({
        where: {
            work_date: new Date(date!)
        },
        take: 20,
    })

    return NextResponse.json(schedules)
}
