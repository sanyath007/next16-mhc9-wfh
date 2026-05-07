import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userWithRole = session?.user as { id: number, role: string }
    if (userWithRole.role === 'VIEWER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    try {
        const existingSchedule = await prisma.schedule.findUnique({
            where: { id },
        })

        if (!existingSchedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        await prisma.schedule.update({
            where: { id },
            data: {
                work_date: body.work_date ? new Date(body.work_date) : undefined,
                employee_id: body.employee_id ? parseInt(body.employee_id) : undefined,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Update error:', error)
        return NextResponse.json(
            { error: 'Failed to update schedule', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userWithRole = session?.user as { id: number, role: string }
    if (userWithRole.role === 'VIEWER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    try {
        const existingSchedule = await prisma.schedule.findUnique({
            where: { id },
        })

        if (!existingSchedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
        }

        await prisma.schedule.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: 'Failed to delete schedule', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}