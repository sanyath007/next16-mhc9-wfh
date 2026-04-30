"use client"

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { NotepadText } from 'lucide-react'

const EmployeeList = ({ employees }: { employees?: any[] | null }) => {
    return (
        <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col items-start justify-between">
                <h3 className="font-display font-semibold text-slate-800">รายชื่อผู้ปฏิบัติงาน Work from Home</h3>
                {/* <span className="text-xs text-slate-400">คลิกแถวเพื่อดูรายอำเภอ</span> */}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                        {['ชื่อ-สกุล','ตำแหน่ง','กลุ่มงาน','รายงาน'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {employees && employees
                            .filter(e => e.status === 1)
                            .map((employee, i) => (
                            <tr
                                key={employee.id}
                                className="hover:bg-brand-50/30 transition-colors cursor-pointer group animate-fadeInUp"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <td className="px-5 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">
                                            {employee.prefix?.name}{employee.firstname} {employee.lastname}
                                        </span>
                                        {/* <ChevronRight className="w-3.5 h-3.5 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                                    </div>
                                </td>
                                <td className="px-5 py-2 text-sm text-slate-600">
                                    {employee.position?.name}{employee.level ? employee.level?.name : ''}
                                </td>
                                <td className="px-5 py-2 text-sm text-slate-600">
                                    {employee.members[0]?.department?.name}
                                </td>
                                <td className="px-5 py-2 text-center">
                                    {/* <ProgressBar value={p.studentCompleted} max={p.studentRequested} /> */}
                                    <button type="button" className="text-emerald-500 cursor-pointer">
                                        <NotepadText className="w-6 h-6" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EmployeeList