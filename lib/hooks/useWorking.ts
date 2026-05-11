"use client"

import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import moment from "moment"

export function useEmployees () {
    const { data: session } = useSession()
    const [data, setData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await fetch(`/api/employee`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const employees = await response.json()
            setData(employees)
        } catch (error) {
            
        }
    } , [])

    useEffect(() => {
        fetchEmployees()
    }, [fetchEmployees])

    return { data, isLoading, error }
}

export function useWorkings ({ schedules, dep = '' }: { schedules: any[] | null, dep?: string }) {
    const { data: session } = useSession()
    const [data, setData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEmployees = useCallback(async (schedules: any[] | null, dep: string) => {
        try {
            const response = await fetch(`/api/employee?dep=${dep}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const employees = await response.json()
            const filteredEmployees = employees.filter((e: any) => schedules && schedules.some(s => s.employee_id === e.id))
            
            const workingsWithSchedule = filteredEmployees.map((e: any) => {
                const schedule = schedules?.find((s: any) => s.employee_id === e.id)
                return {
                    ...e,
                    schedule_id: schedule?.id,
                    reported: schedule?.reported || 0
                }
            })
            
            setData(workingsWithSchedule)
        } catch (error) {
            
        }
    } , [])

    useEffect(() => {
        if (schedules && schedules.length > 0) {
            fetchEmployees(schedules, dep)
        } else {
            setData(null)
        }
    }, [schedules, dep])

    return { data, isLoading, error }
}

export function useSchedules ({ date }: { date: string }) {
    const { data: session } = useSession()
    const [data, setData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSchedules = useCallback(async (date: string) => {
        try {
            const response = await fetch(`/api/schedule?date=${date}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const schedules = await response.json()
            setData(schedules);
        } catch (error) {
            
        }
    }, [])

    useEffect(() => {
        fetchSchedules(date)
    }, [date])

    return { data, isLoading, error }
}

export function useOverdueSchedules ({ employeeId }: { employeeId?: string } = {}) {
    const { data: session } = useSession()
    const [data, setData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchOverdue = useCallback(async () => {
        try {
            const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
            // Fetch schedules before today that are not yet reported
            let url = `/api/schedule?end_date=${yesterday}&reported=0`
            if (employeeId) {
                url += `&employee_id=${employeeId}`
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch overdue schedules');
            }

            const schedules = await response.json()
            setData(schedules);
        } catch (error) {
            console.error(error)
        }
    }, [employeeId])

    useEffect(() => {
        fetchOverdue()
    }, [fetchOverdue])

    return { data, isLoading, error }
}