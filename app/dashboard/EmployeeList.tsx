"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { NotepadText, Download } from 'lucide-react'
import { cn } from '@/lib/utils/tailwindcss'

const EmployeeList = (
    { title, employees, isReport = false }: { title: string, employees?: any[] | null, isReport?: boolean }
) => {
    const handleDownload = async (scheduleId: string) => {
        try {
            const response = await fetch(`/api/download?schedule_id=${scheduleId}`)
            if (response.ok) {
                const data = await response.json()
                if (data.filename) {
                    window.open(`/uploads/${data.filename}`, '_blank')
                }
            }
        } catch (error) {
            console.error('Download error:', error)
        }
    }

    return (
        <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col items-start justify-between">
                <h3 className="font-display font-semibold text-slate-800">{title}</h3>
                {/* <span className="text-xs text-slate-400">คลิกแถวเพื่อดูรายอำเภอ</span> */}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className={cn(
                                `px-5 max-md:px-0 max-md:pl-4 py-3 w-1/3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap`,
                                !isReport ? 'w-[5%] max-md:w-[2%]' : 'w-[8%] max-md:w-[2%]'
                            )}>
                                ลำดับ
                            </th>
                            <th className={cn(
                                `px-5 py-3 w-1/3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap`,
                                !isReport ? 'w-[25%] max-md:w-[28%]' : 'w-[36%] max-md:w-[38%]'
                            )}>
                                ชื่อ-สกุล
                            </th>
                            <th className={cn(
                                `px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap`,
                                !isReport ? 'w-[25%] max-md:w-[40%]' : 'w-[34%] max-md:w-[40%]', 'max-sm:hidden'
                            )}>
                                ตำแหน่ง
                            </th>
                            <th className={cn(
                                `px-5 py-3 w-1/3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap`,
                                !isReport ? 'w-[25%]' : 'w-[36%]', 'max-md:hidden'
                            )}>
                                กลุ่มงาน
                            </th>
                            {isReport && (
                                <th className={cn(`px-5 py-3 w-[10%] text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap`)}>
                                    รายงาน
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {employees && employees.map((employee, i) => (
                            <tr
                                key={employee.id}
                                className={cn(
                                    `hover:bg-brand-50/30 transition-colors cursor-pointer group animate-fadeInUp`,
                                    i === 2 && 'max-md:hidden'
                                )}
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <td className="px-5 max-md:px-0 py-2 text-sm text-center">{i + 1}</td>
                                <td className="px-5 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">
                                            {employee.prefix?.name}{employee.firstname} {employee.lastname}
                                        </span>
                                        {/* <ChevronRight className="w-3.5 h-3.5 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                                    </div>
                                </td>
                                <td className={cn(`px-5 py-2 text-sm text-slate-600`, 'max-sm:hidden')}>
                                    {employee.position?.name}{employee.level ? employee.level?.name !== 'ต้น' ? employee.level?.name : '' : ''}
                                </td>
                                <td className={cn(`px-5 py-2 text-sm text-slate-600`, 'max-md:hidden')}>
                                    {employee.members[0]?.department?.name}
                                </td>
                                {isReport && <td className="px-5 py-2 text-center">
                                    {employee.reported === 1 ? (
                                        <button 
                                            type="button" 
                                            className="text-emerald-500 hover:text-emerald-700 cursor-pointer transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (employee.schedule_id) {
                                                    handleDownload(employee.schedule_id)
                                                }
                                            }}
                                            title="ดาวน์โหลดรายงาน"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <div className="text-slate-300 flex justify-center">
                                            <NotepadText className="w-5 h-5" />
                                        </div>
                                    )}
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EmployeeList