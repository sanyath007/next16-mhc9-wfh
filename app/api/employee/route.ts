import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { includes } from 'zod'

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userWithRole = session?.user as { id: number, role: string }
    if (userWithRole.role === 'VIEWER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()
    try {
        /** Create upload record */
        // const upload = await prisma.employee.create({
        //     data: {
        //         prefix_id: 1,
        //         employee_no: '',
        //         firstname: '',
        //         lastname: ''
        //     },
        // })

        // return NextResponse.json({
        //     success: true,
        //     uploadId: upload.id
        // })
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

    const schedules = await prisma.employee.findMany({
        where: {
            status: 1
        },
        include: {
            prefix: true,
            position: true,
            level: true,
            members: {
                include: {
                    department: true
                }
            },
            changwat: true,
            amphur: true,
            tambon: true,
        }
        // take: 20,
    })

    return NextResponse.json(schedules)
}
