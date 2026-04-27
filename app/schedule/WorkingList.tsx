"use client"

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { EmployeeCard } from "@/components/ui";

const WorkingList = () => {
    const { data: session } = useSession()
    const [schedules, setSchedules] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            setEmployees(data.filter((e: any) => schedules.some(s => s.employee_id === e.id)))
        } catch (error) {
            
        }
    } , [schedules])
    
    const fetchSchedules = useCallback(async () => {
        try {
            const response = await fetch(`/api/schedule`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            setSchedules(data);
        } catch (error) {
            
        }
    }, [])

    useEffect(() => {
        fetchSchedules()
    }, [])
    
    useEffect(() => {
        if (schedules.length > 0) {
            fetchEmployees()
        }
    }, [schedules])

    return (
        <>
            {employees.slice(0, 4).map((e: any, i: number) => (
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