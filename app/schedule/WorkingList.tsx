"use client"

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { EmployeeCard } from "@/components/ui";
import { useWorkings } from "@/lib/hooks/useWorking";

const WorkingList = ({ schedules, onDelete, onEdit }: { schedules: any[] | null, onDelete?: (id: string) => Promise<void>, onEdit?: (id: string, data: { work_date: string; employee_id: number }) => Promise<void> }) => {
    const { data: session } = useSession()
    const { data: employees } = useWorkings({ schedules: schedules })

    const user = session?.user as any
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'EDITOR'

    const employeeWorkings = useMemo(() => {
        return employees?.map(employee => {
            const schedule = schedules?.find(s => s.employee_id === employee.id)
            return { ...employee, ...schedule }
        })
    }, [schedules, employees])

    return (
        <>
            {employeeWorkings && employeeWorkings.map((e: any, i: number) => {
                const isOwner = parseInt(e.employee_id?.toString()) === parseInt(user?.employee_id?.toString())
                const canManage = isAdminOrHR || isOwner

                return (
                    <EmployeeCard
                        key={e.id || i}
                        employee={{
                            id: e.employee_id,
                            name: `${e.firstname} ${e.lastname}`,
                            position: `${e.position?.name}${e.level ? e.level?.name : ''}`,
                            phone: e.tel,
                            email: e.email,
                            address: { district: e.amphur?.name, province: e.changwat?.name },
                            tasks: ['ติดตามผลการดำเนินงาน', 'ประสานงานกับโรงเรียน', 'รายงานสรุป']
                        }}
                        schedule={{
                            id: e.id,
                            work_date: e.work_date,
                            employee_id: e.employee_id
                        }}
                        color="brand"
                        delay={100}
                        onDelete={canManage ? onDelete : undefined}
                        onEdit={canManage ? onEdit : undefined}
                    />
                )
            })}
        </>
    )
}

export default WorkingList