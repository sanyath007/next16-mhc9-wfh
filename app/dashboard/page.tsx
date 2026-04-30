'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Users, MapPin, RefreshCw, Building2, ChevronDown, House } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { StatCard } from '@/components/ui'
import { PIE_COLORS } from '@/lib/constants/dashboard'
import EmployeeList from './EmployeeList'
import DatePicker from '@/components/ui/forms/DatePicker'
import moment from 'moment'
import { useEmployees, useSchedules, useWorkings } from '@/lib/hooks/useWorking'

export default function DashboardPage() {
    const [events, setEvents] = useState([]);
    const [selectedDep, setSelectedDep] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'))

    const { data: schedules } = useSchedules({ date: selectedDate })
    const { data: workings, isLoading } = useWorkings({ schedules: schedules, dep: selectedDep })
    const { data: employees } = useEmployees()

    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8081/laravel80-mhc9-erp-api/public/api/events?sdate=${selectedDate}&edate=${selectedDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': `${process.env.NEXT_PUBLIC_API_KEY}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            console.log(data);

            if (data) {
                let _data: any = [];

                /** ====================== Deduplicating data ====================== */
                data.forEach(event => {
                    const isDuplicate = _data.some(d => new Date(d.OTBHDate).toDateString() === new Date(event.OTBHDate).toDateString() && d.OTBH === event.OTBH);
                    
                    if (!isDuplicate) {
                        _data.push(event);
                    }
                });

                const _events = _data.map(event => {
                    const _filtered = data.filter(d => new Date(event.OTBHDate).toDateString() === new Date(d.OTBHDate).toDateString() && event.OTBH === d.OTBH);

                    /** ====================== Counting attendees ====================== */
                    const attendeeAmt = _filtered.reduce((acc, cur) => {
                        if (event.OTEmid !== cur.OTEmid) {
                            acc = acc + 1;
                        }

                        return acc;
                    }, 1);

                    /** ====================== Listing attendee's name ====================== */
                    const attendees = _filtered.map(d => d.employee?.EmName.split(' ')[0]).join(', ');

                    /** ====================== Creating events data for calendar ====================== */
                    return {
                        id: event.OTId,
                        title: event.OTName,
                        location: event.OTLocation,
                        date: new Date(event.OTDateProject), // Ensure start date is a Date object
                        from: new Date(event.OTDateProject), // Ensure start date is a Date object
                        to: event.OTDateProject2 && new Date(event.OTDateProject2), // Ensure end date is a Date object
                        time: new Date(event.OTDateGo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        duration: `${event.OTDuration} min`,
                        attendees: attendees,
                        people: attendeeAmt,
                        color: event.OTEmid === '48' ? "from-[#f59b9b] to-[#f59b9b]" : "from-[#a1c9a1] to-[#a1c9a1]"
                    };
                });

                // ถ้าเป็นงานที่มีหลายวันติดกัน ให้สร้าง event เพิ่มตามจำนวนวันที่ไป
                const _tempEvents = _events.filter(e => !!e.to);
                _tempEvents.forEach(e => {
                    const _startDate = moment(e.from);
                    const _endDate = e.to && moment(e.to);
                    const _diffDays = _endDate ? _endDate.diff(_startDate, 'days') : 0;

                    if (_diffDays > 0) {
                        for (let i = 1; i <= _diffDays; i++) {
                            const newDate = moment(_startDate).add(i, 'days').toDate();
                            _events.push({
                                ...e,
                                date: newDate
                            });
                        }
                    }
                });

                setEvents(_events);
                console.log(_events);
            }
        } catch (error) {
            
        }
    }, [])

    useEffect(() => {
        fetchEvents()
    }, [])

    // const provinceRecords = useMemo(() => selectedDep ? allRecords.filter(r => r.province === selectedDep) : [], [allRecords, selectedDep])

    const stat = {
        normal: employees?.filter(e => !workings?.some(w => w.id === e.id)).length,
        wfh: workings?.length,
        leaved: 2,
        tripped: 4,
        total: employees?.length,
    }

    const pieData = [
        { name: 'สำนักงาน', value: (stat?.normal ?? 0) - ((stat?.leaved ?? 0) + (stat?.tripped ?? 0)) },
        { name: 'WFH', value: stat?.wfh ?? 0 },
        { name: 'ลา/ไปราชการ', value: (stat?.leaved ?? 0) + (stat?.tripped ?? 0) },
    ].filter(d => d.value > 0)

    const barData = useMemo(() => {
        if (!selectedDep) {
            return [
                {
                    name: 'อำนวยการ',
                    "สำนักงาน": 6,
                    "WFH": 2,
                    "ลา/ไปราชการ": 1
                },
                {
                    name: 'วิชาการสุขภาพจิต',
                    "สำนักงาน": 5,
                    "WFH": 1,
                    "ลา/ไปราชการ": 1
                },
                {
                    name: 'วิชาการสุขภาพจิต',
                    "สำนักงาน": 2,
                    "WFH": 1,
                    "ลา/ไปราชการ": 1
                }
            ]
        }

        return [
            {
                name: selectedDep,
                "สำนักงาน": 9,
                "WFH": 1,
                "ลา/ไปราชการ": 0
            },
        ]
    }, [selectedDep])

    // ── Loading / empty states ──────────────────────────────────────────────────
    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
            </div>
        </div>
    )

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">
                        {selectedDep
                        ? `กลุ่มงาน${selectedDep}`
                        : 'รายงานผลงานการ Work from Home'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* year filter */}
                    <div className="w-full">
                        <DatePicker
                            value={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                            }}
                            inputCss='border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        />
                    </div>

                    <button type="button" className="btn-secondary flex items-center gap-2 text-sm">
                        <RefreshCw className="w-4 h-4" />รีเฟรช
                    </button>
                </div>
            </div>

            {/* Department filter pills */}
            <div className="card px-4 py-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
                        กลุ่มงาน
                    </span>

                    {/* All */}
                    <button
                        onClick={() => setSelectedDep('')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        !selectedDep
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                        }`}
                    >
                        ทั้งหมด
                    </button>

                    {['อำนวยการ','วิชาการสุขภาพจิต','บริการสุขภาพจิต'].map(dep => {
                        const active = selectedDep === dep

                        return (
                            <div key={dep} className="relative group">
                                <button
                                    onClick={() => setSelectedDep(dep)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                                        active
                                            ? 'bg-brand-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                                    }`}
                                >
                                    {dep}
                                    {active && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
                                </button>

                                {/* Tooltip */}
                                {!active && (
                                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30
                                        bg-slate-900 text-white text-xs rounded-xl px-3.5 py-2 whitespace-nowrap
                                        opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                                        transition-all duration-150 shadow-xl hidden"
                                    >
                                        {/* <p className="font-semibold text-white mb-1.5">{p.province}</p> */}
                                        {/* <div className="space-y-1 text-slate-300">
                                            <div className="flex justify-between gap-4">
                                                <span>อำเภอ</span>
                                                <span className="font-mono text-white">{p.districtCount}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span>โรงเรียน</span>
                                                <span className="font-mono text-white">{p.schoolCount}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span>ขอคำปรึกษา</span>
                                                <span className="font-mono text-white">{p.studentRequested.toLocaleString()} คน</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span>สำเร็จ</span>
                                                <span className="font-mono text-white">{p.studentCompleted.toLocaleString()} คน</span>
                                            </div>
                                        </div>
                                        <div className={`mt-2 text-center font-bold text-base ${
                                            p.completionRate >= 70 ? 'text-emerald-400' :
                                            p.completionRate >= 40 ? 'text-amber-400' : 'text-rose-400'
                                        }`}>
                                            {p.completionRate}% สำเร็จ
                                        </div> */}

                                        {/* Arrow */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-[5px] border-transparent border-t-slate-900 w-0 h-0" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="บุคลากรทั้งหมด" value={stat.total!} color="indigo"   delay={0} />
                <StatCard icon={Building2} label="สำนักงาน" value={stat.normal! - (stat.leaved! + stat.tripped!)} color="brand"   delay={50} />
                <StatCard icon={House} label="Work from Home" value={stat.wfh!} color="rose" delay={100} />
                <StatCard icon={MapPin} label="ลา/ไปราชการ" value={stat.leaved! + stat.tripped!} color="emerald"   delay={150} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="card p-6 xl:col-span-2">
                    <h3 className="font-display font-semibold text-slate-800 mb-5">
                        {selectedDep
                            ? `สถิติกลุ่มงาน${selectedDep} (รายคน)`
                            : 'สถิติภาพรวม (รายคน)'}
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData} barGap={2} margin={{ bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                angle={0}
                                textAnchor={selectedDep ? 'end' : 'middle'}
                                interval={0}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px', border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    fontFamily: 'IBM Plex Sans Thai', fontSize: 12,
                                }}
                            />
                            <Legend />
                            <Bar dataKey="สำนักงาน" fill="#3C9EDB" radius={[4,4,0,0]} />
                            <Bar dataKey="WFH" fill="#f43f5e" radius={[4,4,0,0]} />
                            <Bar dataKey="ลา/ไปราชการ" fill="#5bcf8f" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card p-6">
                    <h3 className="font-display font-semibold text-slate-800 mb-5">สัดส่วนสถานะ (รายคน)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'IBM Plex Sans Thai', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-3">
                        {pieData.map((e, i) => (
                            <div key={e.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                                    <span className="text-slate-600">{e.name}</span>
                                </div>
                                <span className="font-mono font-medium text-slate-800">{e.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Work from home employee table */}
            <EmployeeList employees={workings} />

        </div>
    )
}