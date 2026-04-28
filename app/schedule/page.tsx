"use client"

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import moment from "moment";
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Calendar from "@/components/ui/CalendarEvent";
import Modal from "@/components/ui/modals";
import FormField from "@/components/ui/forms/FormField";
import DatePicker from "@/components/ui/forms/DatePicker";
import CustomSelect from "@/components/ui/forms/CustomSelect";
import WorkingList from "./WorkingList";
import { cn } from "@/lib/utils/tailwindcss";

export default function SchedulePage() {
    const today = new Date();

    const { data: session } = useSession()

    // draft dates inside the open panel
    const [tempStart, setTempStart] = useState<Date | null>(null);
    const [tempEnd,   setTempEnd]   = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const initMonth = today.getMonth() === 0 ? 0 : today.getMonth() - 1;
    const [currentMonth, setCurrentMonth] = useState(initMonth);
    const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
    const [showModal, setShowModal] = useState(false)
    const [employees, setEmployees] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'))
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

    // const { register, handleSubmit, formState: { errors } } = useForm({
    //     resolver: zodResolver()
    // })

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

    const onSubmit = async () => {
        try {
            console.log(selectedDate, selectedEmployee);
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    work_date: selectedDate,
                    employee_id: selectedEmployee
                })
            })

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            console.log(data);
            
        } catch (error) {
            
        }
    }

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
            setEmployees(data)
        } catch (error) {
            
        }
    } , [])

    useEffect(() => {
        fetchEmployees()
    }, [])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">ตารางงาน</h1>
                    <p className="text-sm text-slate-500 mt-1">ตารางการปฏิบัติงาน Work from Home ประจำวัน</p>
                </div>
                <button
                    type="button"
                    className={`btn-primary`}
                    onClick={() => setShowModal(true)}
                >
                    เพิ่มตารางงาน
                </button>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <div className="card min-w-lg p-4">
                    <h1 className="mb-4">Add New Schedule</h1>

                    <div className="px-2">
                        <form className="space-y-2">
                            <FormField label="วันที่">
                                <div className="w-full">
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                        }}
                                    />
                                </div>
                            </FormField>
                            <FormField label="บุคลากร">
                                <div className="w-full">
                                    <CustomSelect
                                        options={employees.map(e => ({ value: e.id, label: `${e.firstname} ${e.lastname}` }))}
                                        value={selectedEmployee}
                                        onChange={(value: string) => {
                                            console.log(value);
                                            setSelectedEmployee(value)
                                        }}
                                    />
                                </div>
                            </FormField>

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    className={'btn-error'}
                                    onClick={() => setShowModal(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    className={`btn-primary`}
                                    onClick={onSubmit}
                                >
                                    ตกลง
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            {/* Section Header */}
            <div>
                <div className="px-3 py-3 flex flex-col items-start justify-between">
                    <h3 className="font-display font-semibold text-lg text-slate-800">รายชื่อผู้ปฏิบัติงาน Work From Home</h3>
                    <span className="text-sm text-slate-400">แสดงรายชื่อของพนักงานในแต่ละวัน</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <WorkingList />
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