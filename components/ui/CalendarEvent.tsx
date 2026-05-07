"use client"

import moment from "moment";
import { useState } from "react";
import { DAY_NAMES, MONTH_TH_NAMES } from "@/lib/constants/date-time";
import {
    getDaysInMonth,
    getFirstDayOfMonth,
    sameDay,
    startOfDay
} from "@/lib/utils/date-time";
import { cn } from "@/lib/utils/tailwindcss";

type CalendarProps = {
    year: number,
    month: number,
    showPrev: boolean,
    showNext: boolean,
    onPrev: () => void,
    onNext: () => void,
    onDayClick: (date: Date) => void,
    events?: { date: string | Date, count?: number }[]
};

export default function Calendar({
    year,
    month,
    showPrev,
    showNext,
    onPrev,
    onNext,
    onDayClick,
    events = []
}: CalendarProps) {
    const today     = startOfDay(new Date());
    const totalDays = getDaysInMonth(year, month);
    const firstDay  = getFirstDayOfMonth(year, month);

    const getEventCount = (date: Date) => {
        const dateStr = moment(date).format('YYYY-MM-DD');
        return events
                .filter(e => moment(e.date).format('YYYY-MM-DD') === dateStr)
                .reduce((acc, e) => acc + (e.count || 1), 0);
    };

    const cells = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1)),
    ];

    const [selectedDate, setSelectedDate] = useState(new Date())

    return (
        <div className="flex-1 p-4 min-w-0">
            {/* Month header */}
            <div className="flex items-center justify-between mb-3">
                {showPrev
                    ? <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-400 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-base">‹</button>
                    : <div className="w-7" />
                }
                <span className="text-2xl font-bold text-slate-600 tracking-wide">
                    {MONTH_TH_NAMES[month]} {year+543}
                </span>
                {showNext
                    ? <button onClick={onNext} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-400 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-base">›</button>
                    : <div className="w-7" />
                }
            </div>

            {/* Day name headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-base font-bold uppercase tracking-widest text-slate-600 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-px">
                {cells.map((date, i) => {
                    if (!date) return <div key={`e${i}`} />;

                    const d0 = startOfDay(date);
                    const isToday = sameDay(d0, today);
                    const eventCount = getEventCount(d0);

                    return (
                        <button
                            key={i}
                            onClick={() => {
                                onDayClick(d0)
                                setSelectedDate(d0)
                            }}
                            className={cn(
                                "glass flex flex-col items-center justify-center transition-all select-none aspect-square w-full h-20 text-sm relative border border-slate-200 rounded-lg cursor-pointer px-1",
                                isToday ? "text-brand-400" : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
                                selectedDate.getDate() === d0.getDate() ? "bg-brand-400/20" : ""
                            )}
                        >
                            <span className={cn(
                                "absolute top-2 right-2",
                                isToday ? "after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-brand-500" : ""
                            )}>
                                {date.getDate()}
                            </span>
                            {eventCount > 0 && (
                                <span className="relative w-full h-4 flex items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-medium">
                                    {eventCount > 9 ? '9+' : eventCount} ราย
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}