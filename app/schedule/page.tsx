"use client"

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import Calendar from "@/components/ui/CalendarEvent";
import WorkingList from "./WorkingList";
import AddSchedule from "./AddSchedule";
import { formatThaiDate } from "@/lib/utils/date-time";
import { id } from "zod/v4/locales";

export default function SchedulePage() {
    const today = new Date();
    const initMonth = today.getMonth() === 0 ? 0 : today.getMonth();
    const [currentMonth, setCurrentMonth] = useState(initMonth);
    const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
    const [schedules, setSchedules] = useState<any[]>([])
    const [monthSchedules, setMonthSchedules] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'))

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        }
        else setCurrentMonth(m => m - 1);
    }

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        }
        else setCurrentMonth(m => m + 1);
    }

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

            const data = await response.json()
            setSchedules(data);
        } catch (error) {
            
        }
    }, [])

    const fetchMonthSchedules = useCallback(async (year: number, month: number) => {
        try {
            const startDate = moment([year, month, 1]).startOf('month').format('YYYY-MM-DD');
            const endDate = moment([year, month, 1]).endOf('month').format('YYYY-MM-DD');
            const response = await fetch(`/api/schedule?start_date=${startDate}&end_date=${endDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch month schedules');
            }

            const data = await response.json()
            setMonthSchedules(data);
        } catch (error) {
            console.error(error);
        }
    }, [])

    useEffect(() => {
        fetchSchedules(selectedDate)
    }, [selectedDate])

    useEffect(() => {
        fetchMonthSchedules(currentYear, currentMonth)
    }, [currentYear, currentMonth, schedules])

    const handleDelete = async (id: string) => {
        if (!id || id === "") return;

        try {
            const response = await fetch(`/api/schedule/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            console.log(data);
        } catch (error) {
            
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">ตารางงาน</h1>
                    <p className="text-sm text-slate-500 mt-1">ตารางการปฏิบัติงาน Work from Home ประจำวัน</p>
                </div>
                <AddSchedule onSuccess={() => fetchSchedules(selectedDate)} />
            </div>

            <div className="flex max-md:flex-col gap-4">
                {/* Calendar */}
                <div className="card overflow-hidden w-3/5 max-md:w-full">
                    <div className="px-6 py-3 border-b border-slate-100 flex flex-col items-start justify-between">
                        <h3 className="font-display font-semibold text-lg text-slate-800">ปฏิทินการ Work From Home</h3>
                        <span className="text-sm text-slate-400">แสดงตารางการ Work From Home ของพนักงานในแต่ละวัน</span>
                    </div>
                    <div className="overflow-x-auto px-4 pb-4">
                        <Calendar
                            year={currentYear}
                            month={currentMonth}
                            showPrev
                            showNext
                            onPrev={() => {
                                prevMonth()
                                fetchMonthSchedules(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1)
                            }}
                            onNext={() => {
                                nextMonth()
                                fetchMonthSchedules(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1)
                            }}
                            onDayClick={(date) => {
                                setSelectedDate(moment(date).format('YYYY-MM-DD'))
                                setSchedules([])
                            }}
                            events={monthSchedules.map((s: any) => ({ date: s.work_date, count: 1 }))}
                        />
                    </div>
                </div>

                {/* Work From Home Lists */}
                <div className="w-2/5 max-md:w-full">
                    {/* Section Header */}
                    <div className="px-3 py-3 flex flex-col items-start justify-between">
                        <h3 className="font-display font-semibold text-lg text-slate-800">รายชื่อผู้ปฏิบัติงาน Work From Home</h3>
                        <span className="text-sm text-slate-400">ประจำวันที่ {formatThaiDate(selectedDate)}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <WorkingList
                            schedules={schedules}
                            onDelete={(id) => handleDelete(id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}