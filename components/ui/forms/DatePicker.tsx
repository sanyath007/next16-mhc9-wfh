import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils/tailwindcss';
import { calculateAge } from '@/lib/utils/calculation';
import {
    formatThaiDateShort,
    isFutureDate,
    isTodayInBangkok
} from '@/lib/utils/date-time';
import { MONTH_TH_NAMES, DAY_NAMES } from '@/lib/constants/date-time';
import ErrorMessage from './ErrorMessage';

// ============================================
// Types
// ============================================
export interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    minDate?: string;
    maxDate?: string;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    enableTime?: boolean;
    showAge?: boolean;
    className?: string;
    inputCss?: string;
}

// ============================================
// DatePicker Component
// ============================================

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = 'เลือกวันที่',
    label,
    error,
    disabled = false,
    minDate,
    maxDate,
    disablePastDates = false,
    disableFutureDates = false,
    enableTime = false,
    showAge = false,
    className,
    inputCss
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [calendarViewDate, setCalendarViewDate] = useState(() => {
        if (value) return value.split('T')[0];
        return new Date().toISOString().split('T')[0];
    });
    const [selectedTime, setSelectedTime] = useState({ hours: '08', minutes: '00' });
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [position, setPosition] = useState({ top: 0, left: 0, direction: 'bottom' as 'top' | 'bottom' });
    const [mounted, setMounted] = useState(false);
    
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mount check for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize time from value
    useEffect(() => {
        if (enableTime && value && value.includes('T')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            setSelectedTime({
            hours: date.getHours().toString().padStart(2, '0'),
            minutes: date.getMinutes().toString().padStart(2, '0')
            });
        }
        }
    }, [value, enableTime]);

    // Update calendar view when value changes
    useEffect(() => {
        if (value) {
            setCalendarViewDate(value.split('T')[0]);
        }
    }, [value]);

    // Calculate position
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = enableTime ? 520 : 420;
        const dropdownWidth = 320;
        const padding = 8;
        
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        let top: number;
        let direction: 'top' | 'bottom';
        
        if (spaceBelow >= dropdownHeight + padding || spaceBelow >= spaceAbove) {
            top = rect.bottom + padding;
            direction = 'bottom';
        } else {
            top = rect.top - dropdownHeight - padding;
            direction = 'top';
        }
        
        let left = rect.left;
        if (left + dropdownWidth > window.innerWidth - padding) {
            left = window.innerWidth - dropdownWidth - padding;
        }
        if (left < padding) {
            left = padding;
        }
        
        setPosition({ top, left, direction });
    }, [enableTime]);

    // Update position on open and scroll/resize
    useEffect(() => {
        if (!isOpen) return;
        
        updatePosition();
        
        const handleUpdate = () => updatePosition();
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);
        
        return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
        };
    }, [isOpen, updatePosition]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    // Check if date is disabled
    const isDateDisabled = (dateStr: string): boolean => {
        const today = new Date().toISOString().split('T')[0];
        
        if (disablePastDates && dateStr < today) return true;
        if (disableFutureDates && isFutureDate(dateStr)) return true;
        if (minDate && dateStr < minDate) return true;
        if (maxDate && dateStr > maxDate) return true;
        
        return false;
    };

    // Generate calendar
    const generateCalendar = () => {
        const [year, month] = calendarViewDate.split('-').map(Number);
        const firstDay = new Date(selectedYear, month - 1, 1);
        const lastDay = new Date(selectedYear, month, 0);

        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
        
        const weeks = [];
        const current = new Date(startDate);
        
        while (current <= endDate) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                week.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            weeks.push(week);
        }
        
        return { weeks, currentMonth: month - 1, currentYear: selectedYear };
    };

    // Navigate months
    const navigateMonth = (direction: 'prev' | 'next') => {
        const date = moment(calendarViewDate);
        console.log(date);
        

        if (direction === 'prev') {
            date.add(-1, "month")
        } else {
            date.add(1, "month")
        }

        setSelectedYear(date.year())
        setCalendarViewDate(date.format('YYYY-MM-DD'));
    };

    // Select date
    const selectDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (isDateDisabled(dateStr)) return;

        if (enableTime) {
            const dateTimeStr = `${dateStr}T${selectedTime.hours}:${selectedTime.minutes}:00.000Z`;
            onChange(dateTimeStr);
        } else {
            onChange(dateStr);
            setIsOpen(false);
        }
    };

    // Handle time selection
    const handleTimeSelect = (hours: string, minutes: string) => {
        setSelectedTime({ hours, minutes });
        
        if (value) {
            const baseDate = value.split('T')[0];
            const dateTimeStr = `${baseDate}T${hours}:${minutes}:00.000Z`;
            onChange(dateTimeStr);
        }
    };

    const { weeks, currentMonth } = generateCalendar();

    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minuteOptions = ['00', '15', '30', '45'];

    // Dropdown content
    const dropdownContent = (
        <div
            ref={dropdownRef}
            className={cn(
                'fixed z-[9999] w-80 glass rounded-2xl overflow-hidden border-white/40 shadow-2xl',
                'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 border-b border-white/20">
                <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
                </button>

                <div className="text-center">
                    <h3 className="font-semibold text-slate-800 flex items-center justify-center gap-2">
                        <span>{MONTH_TH_NAMES[currentMonth]}</span>
                        <input
                            type="number"
                            value={selectedYear + 543}
                            onChange={(e) => {
                                const newYear = parseInt(e.target.value) - 543;

                                if (!isNaN(newYear)) {
                                    const date = moment(calendarViewDate);
                                    console.log(date.toDate());
                                    const newDate = `${newYear}-${(date.month() + 1).toString().padStart(2, '0')}-${date.date().toString().padStart(2, '0')}`;
                                    setSelectedYear(newYear);
                                    setCalendarViewDate(newDate);
                                }
                            }}
                            className="w-20 text-center bg-white/50 border border-white/40 rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50"
                        />
                    </h3>
                    {value && (
                        <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                            {formatThaiDateShort(value)}
                            {showAge && ` (${calculateAge(value)})`}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 px-4 py-2">
                {DAY_NAMES.map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            'text-center text-[10px] font-bold uppercase tracking-tighter py-1',
                            index === 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="px-4 pb-4 space-y-1">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((date, dayIndex) => {
                            const isCurrentMonth = date.getMonth() === currentMonth;
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            const dateStr = `${year}-${month}-${day}`;

                            const isSelected = dateStr === (value?.split('T')[0]);
                            const isToday = isTodayInBangkok(dateStr);
                            const isDisabled = isDateDisabled(dateStr);
                            const isSunday = dayIndex === 0;

                            return (
                                <button
                                    key={dayIndex}
                                    type="button"
                                    onClick={() => !isDisabled && selectDate(date)}
                                    disabled={isDisabled}
                                    className={cn(
                                        'w-9 h-9 text-sm rounded-xl transition-all duration-200 font-medium relative flex items-center justify-center',
                                        isDisabled && 'text-slate-200 cursor-not-allowed',
                                        !isDisabled && isSelected && 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105 z-10',
                                        !isDisabled && !isSelected && isToday && 'bg-brand-50/50 text-brand-600 ring-1 ring-brand-300',
                                        !isDisabled && !isSelected && !isToday && isCurrentMonth && isSunday && 'text-rose-500 hover:bg-white/60',
                                        !isDisabled && !isSelected && !isToday && isCurrentMonth && !isSunday && 'text-slate-700 hover:bg-white/60',
                                        !isDisabled && !isSelected && !isToday && !isCurrentMonth && 'text-slate-300 hover:bg-white/40',
                                    )}
                                >
                                    {date.getDate()}
                                    {!isDisabled && isToday && (
                                        <span className={`absolute bottom-1 w-1 h-1 rounded-full ${!isSelected ? "bg-brand-500" : "bg-white"}`}></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Time picker */}
            {enableTime && (
                <div className="px-4 pb-4 pt-3 border-t border-white/20 bg-white/20 dark:bg-white/5">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">เลือกเวลา</label>
                        <Clock size={14} className="text-slate-400" />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedTime.hours}
                            onChange={(e) => handleTimeSelect(e.target.value, selectedTime.minutes)}
                            className="flex-1 px-3 py-2 bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 appearance-none text-center font-mono"
                        >
                            {hourOptions.map(hour => (
                                <option key={hour} value={hour}>{hour}</option>
                            ))}
                        </select>
                        <span className="self-center text-slate-400 font-bold">:</span>
                        <select
                            value={selectedTime.minutes}
                            onChange={(e) => handleTimeSelect(selectedTime.hours, e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 appearance-none text-center font-mono"
                        >
                            {minuteOptions.map(minute => (
                                <option key={minute} value={minute}>{minute}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/40 dark:bg-white/5 border-t border-white/20">
                <button
                    type="button"
                    onClick={() => {
                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        if (!isDateDisabled(todayStr)) {
                            selectDate(today);
                        }
                    }}
                    disabled={isDateDisabled(new Date().toISOString().split('T')[0])}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    วันนี้
                </button>

                <div className="flex gap-2">
                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-wider transition-colors"
                        >
                            ล้าง
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-1.5 text-xs font-bold bg-white/60 text-slate-500 hover:text-slate-300 rounded-lg border border-white/40 hover:bg-white/80 uppercase tracking-wider transition-all"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn('relative', className)}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-2 px-1">
                    {label}
                </label>
            )}
            
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    'input-field flex items-center justify-between gap-2 text-left transition-all',
                    inputCss,
                    isOpen && 'ring-2 ring-brand-400/50 border-brand-400/50 bg-white/70',
                    error ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50/30' : '',
                    disabled && 'opacity-60 cursor-not-allowed'
                )}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Calendar size={18} className={cn(
                        'shrink-0',
                        value ? 'text-brand-500' : 'text-slate-400'
                    )} />
                    <span className={cn(
                        'truncate',
                        value ? 'text-slate-800 font-medium' : 'text-slate-400'
                    )}>
                        {value ? formatThaiDateShort(value) : placeholder}
                    </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    {showAge && value && (
                        <span className="badge bg-brand-50/50 text-brand-600 border-brand-200/50">
                            {calculateAge(value)}
                        </span>
                    )}
                    <ChevronRight size={16} className={cn(
                        'text-slate-400 transition-transform duration-200',
                        isOpen && 'rotate-90 text-brand-500'
                    )} />
                </div>
            </button>
            
            {error && <ErrorMessage message={error} className='mt-1.5 px-1' />}

            {/* Portal Dropdown */}
            {mounted && isOpen && createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default DatePicker;