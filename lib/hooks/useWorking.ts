"use client"

import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"

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
            setData(employees.filter((e: any) => schedules && schedules.some(s => s.employee_id === e.id)))
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