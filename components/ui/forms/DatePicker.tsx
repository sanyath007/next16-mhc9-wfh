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
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
        const [month] = calendarViewDate.split('-').map(Number);
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
                'fixed z-9999 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                'rounded-2xl shadow-2xl overflow-hidden',
                'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50">
                <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                </button>

                <div className="text-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        {MONTH_TH_NAMES[currentMonth]}
                        <input
                            type="number"
                            value={selectedYear + 543}
                            onChange={(e) => {
                                const date = moment(calendarViewDate);
                                const newYear = parseInt(e.target.value) - 543;
                                const newDate = `${newYear}-${(date.month() + 1).toString().padStart(2, '0')}-${date.date().toString().padStart(2, '0')}`;

                                setSelectedYear(newYear);
                                setCalendarViewDate(newDate);
                            }}
                            className="ml-2 w-16 text-center border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-sm"
                        />
                    </h3>
                    {value && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatThaiDateShort(value)}
                            {showAge && ` (${calculateAge(value)})`}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 px-4 py-2">
                {DAY_NAMES.map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            'text-center text-xs font-medium py-1',
                            index === 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
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
                                        'w-9 h-9 text-sm rounded-lg transition-all duration-150 font-medium',
                                        isDisabled && 'text-slate-300 dark:text-slate-600 cursor-not-allowed',
                                        !isDisabled && isSelected && 'bg-primary-500 text-white shadow-md',
                                        !isDisabled && !isSelected && isToday && 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 font-semibold ring-1 ring-primary-300',
                                        !isDisabled && !isSelected && !isToday && isCurrentMonth && isSunday && 'text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700',
                                        !isDisabled && !isSelected && !isToday && isCurrentMonth && !isSunday && 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700',
                                        !isDisabled && !isSelected && !isToday && !isCurrentMonth && 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    )}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Time picker */}
            {enableTime && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">เลือกเวลา</label>
                        <Clock size={16} className="text-slate-400" />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedTime.hours}
                            onChange={(e) => handleTimeSelect(e.target.value, selectedTime.minutes)}
                            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm"
                        >
                            {hourOptions.map(hour => (
                                <option key={hour} value={hour}>{hour}</option>
                            ))}
                        </select>
                        <span className="self-center text-slate-400">:</span>
                        <select
                            value={selectedTime.minutes}
                            onChange={(e) => handleTimeSelect(selectedTime.hours, e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm"
                        >
                            {minuteOptions.map(minute => (
                                <option key={minute} value={minute}>{minute}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
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
                    className="text-sm font-medium text-white dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                        className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                        ล้าง
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
                    'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-left',
                    'transition-colors flex items-center justify-between gap-2', inputCss,
                    error ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-700',
                    disabled && 'opacity-60 cursor-not-allowed'
                )}
            >
                <span className={value ? 'text-slate-900 ' : 'text-slate-400'}>
                    {value ? formatThaiDateShort(value) : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {showAge && value && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {calculateAge(value)}
                        </span>
                    )}
                    <Calendar size={16} className="text-slate-400" />
                </div>
            </button>
            
            {error && <ErrorMessage message={error} className='mt-1' />}

            {/* Portal Dropdown */}
            {mounted && isOpen && createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default DatePicker;