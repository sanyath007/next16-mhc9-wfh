import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const { work_date, employee_id } = await req.json()

    // Role check: If not ADMIN or EDITOR, must be creating for self
    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
        if (parseInt(employee_id.toString()) !== parseInt(user.employee_id.toString())) {
            return NextResponse.json({ error: 'Forbidden: Can only add schedule for yourself' }, { status: 403 })
        }
    }

    try {
        /** Create upload record */
        const upload = await prisma.schedule.create({
            data: {
                work_date: new Date(work_date),
                employee_id: parseInt(employee_id.toString()),
                reported: 0,
                created_by: parseInt(user.employee_id?.toString() || user.id?.toString())
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
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const employeeId = searchParams.get("employee_id")
    const reported = searchParams.get("reported")

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const whereClause: any = {}

    if (date) {
        whereClause.work_date = new Date(date)
    } else if (startDate && endDate) {
        whereClause.work_date = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        }
    }

    if (employeeId) {
        whereClause.employee_id = parseInt(employeeId)
    }

    if (reported !== null && reported !== undefined) {
        whereClause.reported = parseInt(reported)
    }

    const schedules = await prisma.schedule.findMany({
        where: whereClause,
        include: {
            employee: {
                include: {
                    position: {
                        select: {
                            name: true
                        }
                    },
                    level: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            work_date: 'desc'
        }
    })

    return NextResponse.json(schedules)
}