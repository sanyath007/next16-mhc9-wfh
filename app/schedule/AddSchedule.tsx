"use client"

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import moment from "moment";
import { cn } from "@/lib/utils/tailwindcss";
import Modal from "@/components/ui/modals";
import FormField from "@/components/ui/forms/FormField";
import DatePicker from "@/components/ui/forms/DatePicker";
import CustomSelect from "@/components/ui/forms/CustomSelect";

const AddSchedule = ({ onSuccess }: { onSuccess: () => void }) => {
    const { data: session } = useSession()
    const [showModal, setShowModal] = useState(false)
    const [employees, setEmployees] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'))
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

    const user = session?.user as any
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'EDITOR'

    const onSubmit = async () => {
        if (!selectedEmployee) return;

        try {
            console.log(selectedDate, selectedEmployee);
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    work_date: selectedDate,
                    employee_id: typeof selectedEmployee === 'string' ? parseInt(selectedEmployee) : selectedEmployee
                })
            })

            if (!response.ok) {
                throw new Error('Failed to add schedule');
            }

            onSuccess()
            setShowModal(false)
            // Reset employee selection if admin
            if (isAdminOrHR) {
                setSelectedEmployee(null)
            }
        } catch (error) {
            console.error('Error adding schedule:', error)
        }
    }

    const fetchEmployees = useCallback(async () => {
        if (!isAdminOrHR) return;

        try {
            const response = await fetch(`/api/employee`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }

            const data = await response.json()
            setEmployees(data.filter((e: any) => e.status === 1))
        } catch (error) {
            console.error('Error fetching employees:', error)
        }
    } , [isAdminOrHR, user?.access_token])

    useEffect(() => {
        if (showModal) {
            if (isAdminOrHR) {
                fetchEmployees()
            } else if (user?.employee_id) {
                setSelectedEmployee(user.employee_id.toString())
            }
        }
    }, [showModal, isAdminOrHR, user?.employee_id, fetchEmployees])

    return (
        <>
            <button
                type="button"
                className={`btn-primary`}
                onClick={() => setShowModal(true)}
            >
                เพิ่มตารางงาน
            </button>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <div className="w-full p-6">
                    <h1 className="mb-4">เพิ่มตารางงานใหม่</h1>

                    <div className="px-2">
                        <form className="space-y-2">
                            <FormField label="วันที่">
                                <div className="w-full">
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                        }}
                                        inputCss='border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    />
                                </div>
                            </FormField>

                            {isAdminOrHR ? (
                                <FormField label="บุคลากร">
                                    <div className="w-full">
                                        <CustomSelect
                                            options={employees.map(e => ({ value: e.id.toString(), label: `${e.firstname} ${e.lastname}` }))}
                                            value={selectedEmployee}
                                            onChange={(value: string) => {
                                                console.log(value);
                                                setSelectedEmployee(value)
                                            }}
                                            clearable
                                        />
                                    </div>
                                </FormField>
                            ) : (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">บุคลากร</div>
                                    <div className="text-slate-700 font-medium">{user?.name}</div>
                                </div>
                            )}

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
                                    disabled={!selectedEmployee}
                                >
                                    ตกลง
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default AddSchedule