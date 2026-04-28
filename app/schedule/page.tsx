"use client"

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Calendar from "@/components/ui/CalendarEvent";
import WorkingList from "./WorkingList";
import AddSchedule from "./AddSchedule";
import moment from "moment";

export default function SchedulePage() {
    const today = new Date();
    const { data: session } = useSession()

    // draft dates inside the open panel
    const initMonth = today.getMonth() === 0 ? 0 : today.getMonth() - 1;
    const [tempStart, setTempStart] = useState<Date | null>(null);
    const [tempEnd,   setTempEnd]   = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const [currentMonth, setCurrentMonth] = useState(initMonth);
    const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
    const [schedules, setSchedules] = useState<any[]>([])

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        }
        else setCurrentMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        }
        else setCurrentMonth(m => m + 1);
    };

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
        fetchSchedules(moment().format('YYYY-MM-DD'))
    }, [])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">ตารางงาน</h1>
                    <p className="text-sm text-slate-500 mt-1">ตารางการปฏิบัติงาน Work from Home ประจำวัน</p>
                </div>
                <AddSchedule onSuccess={() => fetchSchedules(moment().format('YYYY-MM-DD'))} />
            </div>

            {/* Section Header */}
            <div>
                <div className="px-3 py-3 flex flex-col items-start justify-between">
                    <h3 className="font-display font-semibold text-lg text-slate-800">รายชื่อผู้ปฏิบัติงาน Work From Home</h3>
                    <span className="text-sm text-slate-400">แสดงรายชื่อของพนักงานในแต่ละวัน</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <WorkingList schedules={schedules} />
                </div>
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
                        startDate={tempStart}
                        endDate={tempEnd}
                        hoverDate={hoverDate}
                        onDayClick={() => console.log('Day clicked')}
                        onDayHover={d => { if (!tempEnd) setHoverDate(d); }}
                    />
                </div>
            </div>
        </div>
    )
}