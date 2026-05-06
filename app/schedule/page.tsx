"use client"

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import Calendar from "@/components/ui/CalendarEvent";
import WorkingList from "./WorkingList";
import AddSchedule from "./AddSchedule";
import { formatThaiDate } from "@/lib/utils/date-time";

export default function SchedulePage() {
    const today = new Date();
    const initMonth = today.getMonth() === 0 ? 0 : today.getMonth();
    const [currentMonth, setCurrentMonth] = useState(initMonth);
    const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
    const [schedules, setSchedules] = useState<any[]>([])
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

    useEffect(() => {
        fetchSchedules(selectedDate)
    }, [selectedDate])

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

            {/* Calendar */}
            <div className="card overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-100 flex flex-col items-start justify-between">
                    <h3 className="font-display font-semibold text-lg text-slate-800">ปฏิทินงาน Work From Home</h3>
                    <span className="text-sm text-slate-400">แสดงตารางงานของแต่ละพนักงานในแต่ละวัน</span>
                </div>
                <div className="overflow-x-auto px-6 pb-6">
                    <Calendar
                        year={currentYear}
                        month={currentMonth}
                        showPrev
                        showNext
                        onPrev={prevMonth}
                        onNext={nextMonth}
                        onDayClick={(date) => {
                            setSelectedDate(moment(date).format('YYYY-MM-DD'))
                            setSchedules([])
                        }}
                    />
                </div>
            </div>

            {/* Work From Home Lists */}
            <div>
                {/* Section Header */}
                <div className="px-3 py-3 flex flex-col items-start justify-between">
                    <h3 className="font-display font-semibold text-lg text-slate-800">รายชื่อผู้ปฏิบัติงาน Work From Home ประจำวันที่ {formatThaiDate(selectedDate)}</h3>
                    <span className="text-sm text-slate-400">แสดงรายชื่อของพนักงานในแต่ละวัน</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <WorkingList schedules={schedules} />
                </div>
            </div>
        </div>
    )
}