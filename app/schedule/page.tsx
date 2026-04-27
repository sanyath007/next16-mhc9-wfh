"use client"

import Calendar from "@/components/ui/CalendarEvent";
import { EmployeeCard } from "@/components/ui";
import { useState } from "react";

export default function SchedulePage() {
    const today = new Date();

    // draft dates inside the open panel
    const [tempStart, setTempStart] = useState<Date | null>(null);
    const [tempEnd,   setTempEnd]   = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const initMonth = today.getMonth() === 0 ? 0 : today.getMonth() - 1;
    const [currentMonth, setCurrentMonth] = useState(initMonth);
    const [currentYear,  setCurrentYear]  = useState(today.getFullYear());

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">ตารางงาน</h1>
                    <p className="text-sm text-slate-500 mt-1">ตารางการปฏิบัติงาน Work from Home ประจำวัน</p>
                </div>
            </div>

            {/* Section Header */}
            <div>
                <div className="px-3 py-3 flex flex-col items-start justify-between">
                    <h3 className="font-display font-semibold text-lg text-slate-800">รายชื่อผู้ปฏิบัติงาน Work From Home</h3>
                    <span className="text-sm text-slate-400">แสดงรายชื่อของพนักงานในแต่ละวัน</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <EmployeeCard
                        employee={{
                            name: 'นางสาวสมศรี ใจดี',
                            position: 'เจ้าหน้าที่ประสานงาน',
                            phone: '02-123-4567',
                            address: { district: 'เขตบางรัก', province: 'กรุงเทพมหานคร' },
                            tasks: ['ติดตามผลการดำเนินงาน', 'ประสานงานกับโรงเรียน', 'รายงานสรุป']
                        }}
                        color="brand"
                        delay={100}
                    />
                    <EmployeeCard
                        employee={{
                            name: 'นายสมชาย แสนดี',
                            position: 'เจ้าหน้าที่เทคนิค',
                            phone: '02-987-6543',
                            address: { district: 'เขตคลองเตย', province: 'กรุงเทพมหานคร' },
                            tasks: ['ดูแลระบบออนไลน์', 'แก้ไขปัญหาทางเทคนิค', 'สนับสนุนการใช้งาน']
                        }}
                        color="emerald"
                        delay={200}
                    />
                    <EmployeeCard
                        employee={{
                            name: 'นางสาวสุนิสา รักเรียน',
                            position: 'เจ้าหน้าที่วิเคราะห์ข้อมูล',
                            phone: '02-555-1234',
                            address: { district: 'เขตปทุมวัน', province: 'กรุงเทพมหานคร' },
                            tasks: ['วิเคราะห์ข้อมูลการดำเนินงาน', 'จัดทำรายงานสถิติ', 'ให้คำแนะนำเชิงกลยุทธ์']
                        }}
                        color="amber"
                        delay={300}
                    />
                    <EmployeeCard
                        employee={{
                            name: 'นายวิทยา ใจเย็น',
                            position: 'เจ้าหน้าที่สนับสนุน',
                            phone: '02-444-5678',
                            address: { district: 'เขตสาทร', province: 'กรุงเทพมหานคร' },
                            tasks: ['ตอบคำถามจากโรงเรียน', 'ให้คำปรึกษาเบื้องต้น', 'ประสานงานกับฝ่ายอื่นๆ']
                        }}
                        color="rose"
                        delay={400}
                    />
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