'use client'

import React from 'react'
import moment from 'moment'

interface WeeklyReportTemplateProps {
    data: any[]
    startDate: string
    endDate: string
    orgName?: string
}

const WeeklyReportTemplate = React.forwardRef<HTMLDivElement, WeeklyReportTemplateProps>(({ data, startDate, endDate, orgName = 'ศูนย์สุขภาพจิตที่ ๙' }, ref) => {
    const startM = moment(startDate).locale('th')
    const endM = moment(endDate).locale('th')
    
    const dateRangeStr = `ณ วันที่ ${startM.format('D')} ${startM.month() === endM.month() ? '' : startM.format('MMMM')} - ${endM.format('D MMMM')} พ.ศ. ${endM.year() + 543}`

    return (
        <div ref={ref} className="p-8 bg-white text-black font-['Prompt',_sans-serif] w-[297mm] min-h-[210mm] mx-auto overflow-hidden">
            <div className="text-center space-y-1 mb-8">
                <h1 className="text-xl font-bold">รายงานผลการปฏิบัติงานนอกสถานที่ตั้งของส่วนราชการ</h1>
                <h2 className="text-lg font-bold">(Work from Home)</h2>
                <h3 className="text-lg font-bold">{orgName}</h3>
                <h4 className="text-md font-bold">{dateRangeStr}</h4>
            </div>

            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr>
                        <th rowSpan={2} className="border border-black p-2 w-12">ลำดับ</th>
                        <th rowSpan={2} className="border border-black p-2">ชื่อ - นามสกุล</th>
                        <th rowSpan={2} className="border border-black p-2">ตำแหน่ง</th>
                        <th rowSpan={2} className="border border-black p-2 w-32">เวลา<br/>การปฏิบัติราชการ</th>
                        <th colSpan={2} className="border border-black p-2">ส่งรายงาน<br/>ข้อตกลงและรายงาน<br/>การปฏิบัติราชการ</th>
                        <th rowSpan={2} className="border border-black p-2 w-48">หมายเหตุ</th>
                    </tr>
                    <tr>
                        <th className="border border-black p-1 w-20 text-xs">ยังไม่<br/>ดำเนินการ</th>
                        <th className="border border-black p-1 w-20 text-xs">ดำเนินการ<br/>เรียบร้อยแล้ว</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="border border-black p-2 text-center">{index + 1}</td>
                            <td className="border border-black p-2">{item.name}</td>
                            <td className="border border-black p-2">{item.position}</td>
                            <td className="border border-black p-2 text-center">08.30 - 16.30 น.</td>
                            <td className="border border-black p-2 text-center">{!item.reported ? '/' : ''}</td>
                            <td className="border border-black p-2 text-center">{item.reported ? '/' : ''}</td>
                            <td className="border border-black p-2 text-xs">
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
                        <p>ผู้อำนวยการศูนย์สุขภาพจิตที่ ๙</p>
                        <p>วันที่ .......... เดือน ..................... พ.ศ. ...............</p>
                    </div>
                </div>
            </div>
        </div>
    )
})

WeeklyReportTemplate.displayName = 'WeeklyReportTemplate'

export default WeeklyReportTemplate
