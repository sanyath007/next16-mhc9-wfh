"use client"

import Calendar from "@/components/ui/CalendarEvent";
import { MapPin, PhoneCall } from "lucide-react";
import { useRef, useState } from "react";

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
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
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

export function EmployeeCard({
    employee,
    color = 'brand',
    delay = 0
}: { employee: any, color?: string; delay?: number }) {
    const colors: Record<string, string> = {
        brand:   'bg-brand-500/10 text-brand-600 border border-brand-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
        amber:   'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        rose:    'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    }

    return (
        <div
            className={`card p-6 flex flex-col gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-${color}-500/10 animate-fadeInUp`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Employee Info */}
            <div className="flex max-md:flex-col items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&size=80&background=1c1e2b&color=fff&bold=true`}
                        alt="User Avatar"
                        className="w-14 h-14 rounded-full ring-2 ring-white shadow-sm"
                    />
                    <div className="absolute bottom-1 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h2 className="font-semibold text-lg text-slate-800">{employee.name}</h2>
                    <p className="text-sm text-slate-600">{employee.position}</p>
                </div>
            </div>
            {/* Employee Contacts */}
            <div className="mb-2 space-y-2">
                <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs">{employee.address.district}, {employee.address.province}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                    <PhoneCall className="w-4 h-4 text-brand-500" />
                    <span className="text-xs">{employee.phone}</span>
                </div>
            </div>
            {/* Employee Tasks */}
            <div className="bg-slate-200 p-3 rounded-2xl">
                <h4 className="text-sm font-semibold text-slate-600">งานวันนี้:</h4>
                <p className="text-xs text-slate-600">{employee.tasks.join(', ')}</p>
            </div>
        </div>
    )
}