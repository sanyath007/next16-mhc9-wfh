'use client'

import React from 'react'
import moment from 'moment'
import { Sarabun } from 'next/font/google'
import { cn } from '@/lib/utils/tailwindcss';

const sarabun = Sarabun({
  weight: ['400', '700'], // Specify needed weights
  subsets: ['thai', 'latin'], // Specify needed subsets
  display: 'swap', // Recommended for better performance
});

interface WeeklyReportTemplateProps {
    data: any[]
    startDate: string
    endDate: string
    orgName?: string
}

const WeeklyReportTemplate = React.forwardRef<HTMLDivElement, WeeklyReportTemplateProps>(({ data, startDate, endDate, orgName = 'ศูนย์สุขภาพจิตที่ 9' }, ref) => {
    const startM = moment(startDate).locale('th')
    const endM = moment(endDate).locale('th')
    
    const dateRangeStr = `ณ วันที่ ${startM.format('D')} ${startM.month() === endM.month() ? '' : startM.format('MMMM')} - ${endM.format('D MMMM')} พ.ศ. ${endM.year() + 543}`

    return (
        <div ref={ref} className={ cn("p-2 bg-white text-black w-[297mm] min-h-[210mm] mx-0 overflow-hidden", sarabun.className) }>
            <div className="text-center space-y-1 mb-8">
                <h1 className="text-xl font-bold">รายงานผลการปฏิบัติงานนอกสถานที่ตั้งของส่วนราชการ</h1>
                <h2 className="text-lg font-bold">(Work from Home)</h2>
                <h3 className="text-lg font-bold">{orgName}</h3>
                <h4 className="text-md font-bold">{dateRangeStr}</h4>
            </div>

            <table className="w-full border-collapse border border-black text-sm leading-relaxed">
                <thead>
                    <tr>
                        <th rowSpan={2} className="border border-black py-2 px-3 w-[5%] align-middle">ลำดับ</th>
                        <th rowSpan={2} className="border border-black py-2 px-3 align-middle">ชื่อ - นามสกุล</th>
                        <th rowSpan={2} className="border border-black py-2 px-3 w-[25%] align-middle">ตำแหน่ง</th>
                        <th rowSpan={2} className="border border-black py-2 px-3 w-[15%] align-middle">เวลา<br/>การปฏิบัติราชการ</th>
                        <th colSpan={2} className="border border-black py-2 px-3 align-middle">ส่งรายงาน<br/>ข้อตกลงและรายงาน<br/>การปฏิบัติราชการ</th>
                        <th rowSpan={2} className="border border-black py-2 px-3 w-[15%] align-middle">หมายเหตุ</th>
                    </tr>
                    <tr>
                        <th className="border border-black py-2 px-2 w-[8%] text-xs align-middle">ยังไม่<br/>ดำเนินการ</th>
                        <th className="border border-black py-2 px-2 w-[8%] text-xs align-middle">ดำเนินการ<br/>เรียบร้อยแล้ว</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="border border-black py-2 px-3 text-center align-middle">{index + 1}</td>
                            <td className="border border-black py-2 px-3 align-middle">{item.name}</td>
                            <td className="border border-black py-2 px-3 align-middle">{item.position}</td>
                            <td className="border border-black py-2 px-3 text-center align-middle">08.30 - 16.30 น.</td>
                            <td className="border border-black py-2 px-3 text-center align-middle">{!item.reported ? '/' : ''}</td>
                            <td className="border border-black py-2 px-3 text-center align-middle">{item.reported ? '/' : ''}</td>
                            <td className="border border-black py-2 px-3 text-xs align-middle">
                                WFH. วันที่ {item.dates.join(', ')}
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={7} className="border border-black p-8 text-center text-slate-400">
                                ไม่พบข้อมูลการ Work From Home ในช่วงเวลาที่เลือก
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="mt-8 space-y-4">
                <p className="font-bold">ข้อเสนอแนะ</p>
                <div className="border-b border-dotted border-black h-6 w-full"></div>
                <div className="border-b border-dotted border-black h-6 w-full"></div>
                <div className="border-b border-dotted border-black h-6 w-full"></div>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8 text-center">
                <div className="space-y-12">
                    <div>
                        <p>ลงชื่อ...............................................................</p>
                        <p>(...............................................................)</p>
                        <p>ตำแหน่ง...............................................................</p>
                        <p>วันที่ .......... เดือน ..................... พ.ศ. ...............</p>
                    </div>
                </div>
                <div className="space-y-12">
                    <div>
                        <p>ลงชื่อ...............................................................</p>
                        <p>(นางสาวจุฑามาศ วรรณศิลป์)</p>
                        <p>ผู้อำนวยการศูนย์สุขภาพจิตที่ 9</p>
                        <p>วันที่ .......... เดือน ..................... พ.ศ. ...............</p>
                    </div>
                </div>
            </div>
        </div>
    )
})

WeeklyReportTemplate.displayName = 'WeeklyReportTemplate'

export default WeeklyReportTemplate
