"use client"

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { EmployeeCard } from "@/components/ui";
import { useWorkings } from "@/lib/hooks/useWorking";

const WorkingList = ({ schedules }: { schedules: any[] }) => {
    const { data: session } = useSession()
    const { data: employees } = useWorkings({ schedules: schedules })

    return (
        <>
            {employees && employees.slice(0, 4).map((e: any, i: number) => (
                <EmployeeCard
                    key={e.id}
                    employee={{
                        name: `${e.firstname} ${e.lastname}`,
                        position: `${e.position?.name}${e.level ? e.level?.name : ''}`,
                        phone: e.tel,
                        email: e.email,
                        address: { district: e.amphur?.name, province: e.changwat?.name },
                        tasks: ['ติดตามผลการดำเนินงาน', 'ประสานงานกับโรงเรียน', 'รายงานสรุป']
                    }}
                    color="brand"
                    delay={100}
                />
            ))}
        </>
    )
}

export default WorkingList