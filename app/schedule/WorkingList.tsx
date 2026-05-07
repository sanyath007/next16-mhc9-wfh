"use client"

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { EmployeeCard } from "@/components/ui";
import { useWorkings } from "@/lib/hooks/useWorking";

const WorkingList = ({ schedules, onDelete }: { schedules: any[] | null, onDelete?: (id: string) => Promise<void> }) => {
    const { data: session } = useSession()
    const { data: employees } = useWorkings({ schedules: schedules })

    const employeeWorkings = useMemo(() => {
        return employees?.map(employee => {
            const schedule = schedules?.find(s => s.employee_id === employee.id)
            return { ...employee, ...schedule }
    })
    }, [schedules, employees])

    return (
        <>
            {employeeWorkings && employeeWorkings.map((e: any, i: number) => (
                <EmployeeCard
                    key={e.id}
                    id={e.id}
                    employee={{
                        id: e.employee_id,
                        name: `${e.firstname} ${e.lastname}`,
                        position: `${e.position?.name}${e.level ? e.level?.name : ''}`,
                        phone: e.tel,
                        email: e.email,
                        address: { district: e.amphur?.name, province: e.changwat?.name },
                        tasks: ['ติดตามผลการดำเนินงาน', 'ประสานงานกับโรงเรียน', 'รายงานสรุป']
                    }}
                    color="brand"
                    delay={100}
                    onDelete={onDelete!}
                />
            ))}
        </>
    )
}

export default WorkingList