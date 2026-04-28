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

    // const { register, handleSubmit, formState: { errors } } = useForm({
    //     resolver: zodResolver()
    // })

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
            onSuccess()
            setShowModal(true)
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
            setEmployees(data.filter((e: any) => e.status === 1))
        } catch (error) {
            
        }
    } , [])

    useEffect(() => {
        fetchEmployees()
    }, [])

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
                                        inputCss='border-slate-200 hover:border-slate-300 hover:shadow-sm'
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
                                        clearable
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
        </>
    )
}

export default AddSchedule