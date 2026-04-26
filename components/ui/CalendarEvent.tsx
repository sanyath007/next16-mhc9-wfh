import { DAY_NAMES, MONTH_TH_NAMES } from "@/lib/constants/date-time";
import {
    getDaysInMonth,
    getFirstDayOfMonth,
    sameDay,
    startOfDay
} from "@/lib/utils/date-time";

type CalendarProps = {
    year: number,
    month: number,
    showPrev: boolean,
    showNext: boolean,
    onPrev: () => void,
    onNext: () => void,
    startDate: Date | null,
    endDate: Date | null,
    hoverDate: Date | null,
    onDayClick: (date: Date) => void,
    onDayHover: (date: Date | null) => void,
};

export default function Calendar({
    year,
    month,
    showPrev,
    showNext,
    onPrev,
    onNext,
    startDate,
    endDate,
    hoverDate,
    onDayClick,
    onDayHover
}: CalendarProps) {
    const today     = startOfDay(new Date());
    const totalDays = getDaysInMonth(year, month);
    const firstDay  = getFirstDayOfMonth(year, month);
    const rangeEnd  = endDate || hoverDate;

    const cells = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1)),
    ];

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

                    const d0         = startOfDay(date);
                    const isToday    = sameDay(d0, today);
                    const lo         = startDate && rangeEnd ? (startDate <= rangeEnd ? startDate : rangeEnd) : null;
                    const hi         = startDate && rangeEnd ? (startDate <= rangeEnd ? rangeEnd : startDate) : null;
                    const inRange    = lo && hi && d0 > lo && d0 < hi;
                    const isStart    = lo && sameDay(d0, lo);
                    const isEnd      = hi && sameDay(d0, hi) && !sameDay(lo, hi);

                    return (
                        <button
                            key={i}
                            onClick={() => onDayClick(d0)}
                            onMouseEnter={() => onDayHover(d0)}
                            className={[
                                "flex items-center justify-center transition-all select-none aspect-square w-full h-25 text-sm relative border border-slate-200",
                                // range coloring
                                inRange  ? "bg-brand-300 text-white rounded-none"   : "",
                                isStart  ? "bg-brand-600 text-white font-medium " + (hi && !sameDay(lo, hi) ? "rounded-l-lg rounded-r-none" : "rounded-lg") : "",
                                isEnd    ? "bg-brand-600 text-white font-medium rounded-r-lg rounded-l-none" : "",
                                !isStart && !isEnd && !inRange ? "rounded-lg" : "",
                                // default states
                                !isStart && !isEnd && !inRange ? (isToday ? "text-brand-400" : "text-slate-600 hover:bg-white/60 hover:text-slate-900") : "",
                            ].join(" ")}
                        >
                            <span className={["relative", isToday && !isStart && !isEnd ? "after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-brand-500" : ""].join(" ")}>
                                {date.getDate()}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}