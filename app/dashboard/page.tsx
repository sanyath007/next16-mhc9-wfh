'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Users, MapPin, Building2, ChevronDown, House } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { StatCard } from '@/components/ui'
import EmployeeList from './EmployeeList'
import DatePicker from '@/components/ui/forms/DatePicker'
import moment from 'moment'
import { useEmployees, useSchedules, useWorkings } from '@/lib/hooks/useWorking'

export default function DashboardPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDep, setSelectedDep] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'))
    const { data: session } = useSession()

    const { data: schedules } = useSchedules({ date: selectedDate })
    const { data: workings } = useWorkings({ schedules: schedules, dep: selectedDep })
    const { data: employees } = useEmployees()

    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_URL}/api/m2m/events?sdate=${selectedDate}&edate=${selectedDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user?.access_token}`
                    // 'X-API-KEY': `${process.env.NEXT_PUBLIC_API_KEY}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            if (data) {
                let _employees: any = [];

                /** Deduplicating data */
                data.forEach((event: any) => {
                    const isDuplicate = _employees.some((emp: any) => emp.EmId === event.employee?.EmId);
                    
                    if (!isDuplicate) {
                        _employees.push(event.employee);
                    }
                });

                const _trips = _employees.map((employee: any) => {
                    const _filtered = data.filter((d: any) => employee.EmId === d.employee?.EmId);
                    /** Listing employee's events */
                    const events = _filtered.map((e: any) => `${e.OTName} ณ ${e.OTLocation}`).join(', ');

                    return {
                        id: employee.EmId,
                        name: `${employee.EmPerfix}${employee.EmName}`,
                        position: { id: parseInt(employee.EmPosition), name: employee.position?.PosName },
                        department: { id: parseInt(employee.EmSession), name: employee.department?.SeName },
                        events
                    };
                });

                setTrips(_trips);
                
            }
        } catch (error) {
            
        }
    }, [selectedDate])

    const fetchLeaves = useCallback(async () => {
        setIsLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_URL}/api/m2m/leaves?sdate=${selectedDate}&edate=${selectedDate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user?.access_token}`
                    // 'X-API-KEY': `${process.env.NEXT_PUBLIC_API_KEY}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            if (data) {
                const _leaves = data.map((leave: any) => ({
                    id: leave.LeaveId,
                    type: leave.LeaveName,
                    start: leave.LeaveDate1,
                    end: leave.LeaveDate2,
                    time: leave.LeaveTime1,
                    days: parseFloat(leave.LeaveCountDay), 
                    hours: parseFloat(leave.LeaveCountTime), 
                    status: leave.LeaveStatus,
                    employee: {
                        id: leave.employee.EmId,
                        name: `${leave.employee.EmPerfix}${leave.employee.EmName}`,
                        position: { id: parseInt(leave.employee.EmPosition), name: leave.employee.position?.PosName },
                        department: { id: parseInt(leave.employee.EmSession), name: leave.employee.department?.SeName },
                    }
                }))

                setLeaves(_leaves)
            }
        } catch (error) {
            
        } finally {
            setIsLoading(false)
        }
    }, [selectedDate])

    useEffect(() => {
        fetchEvents()
        fetchLeaves()
    }, [selectedDate])

    const tempLeaved = useMemo(() => {
        return leaves.filter((leave: any) => leave.type === 'ชั่วโมง').length
    }, [leaves])

    const offices = useMemo(() => {
        return employees?.filter(e => 
            !workings?.some(w => w.id === parseInt(e.id))
                && (!leaves?.some(l => l.id === parseInt(e.employee_no)))
                && !trips?.some(t => t.id === parseInt(e.employee_no))
        )
    }, [workings, leaves, trips])

    const stat = {
        normal: offices?.length,
        wfh: workings?.length || 0,
        leaved: leaves.filter((leave: any) => leave.type !== 'ชั่วโมง').length,
        tripped: trips.length,
        total: employees?.length,
    }

    const departments = useMemo(() => {
        console.log(leaves, trips);
        
        return ['อำนวยการ','วิชาการสุขภาพจิต','บริการสุขภาพจิต'].map(dep => ({
            name: dep,
            "สำนักงาน": offices?.filter(e => (e.members[0]?.department?.name as string).includes(dep)).length,
            "WFH": workings?.filter(w => (w.members[0]?.department?.name as string).includes(dep)).length || 0,
            "ลา/ไปราชการ": leaves.filter((leave: any) => leave.type !== 'ชั่วโมง' && (leave.employee?.department?.name as string).includes(dep)).length
                + trips.filter((trip: any) => (trip.department?.name as string).includes(dep)).length
        }))
    }, [selectedDate, selectedDep, offices, workings, leaves, trips])

    const pieData = [
        { name: 'สำนักงาน', value: (stat?.normal ?? 0) - ((stat?.leaved ?? 0) + (stat?.tripped ?? 0)), color: '#3C9EDB' },
        { name: 'WFH', value: stat?.wfh ?? 0, color: '#f43f5e' },
        { name: 'ลา/ไปราชการ', value: (stat?.leaved ?? 0) + (stat?.tripped ?? 0), color: '#5bcf8f' },
    ]

    const barData = useMemo(() => {
        if (!selectedDep) {
            return departments
        }

        return departments.filter(dep => dep.name === selectedDep)
    }, [selectedDate, selectedDep, departments])

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
            <div className="flex items-center justify-between max-md:justify-end">
                <div className="max-md:hidden">
                    <h1 className="font-display text-3xl font-bold text-slate-900">
                        {selectedDep
                        ? `กลุ่มงาน${selectedDep}`
                        : 'รายงานผลงานการ Work From Home'}
                    </h1>
                </div>
                <div className="flex items-center gap-2 max-md:w-full">
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
                <StatCard icon={Users} label="บุคลากรทั้งหมด" value={stat.total!} color="indigo" delay={0} />
                <StatCard icon={Building2} label="สำนักงาน" value={stat.normal!} color="brand" delay={50} />
                <StatCard icon={House} label="Work from Home" value={stat.wfh!} color="rose" delay={100} />
                <StatCard
                    icon={MapPin}
                    label="ลา/ไปราชการ"
                    value={stat.leaved! + stat.tripped! + ` (${tempLeaved})`}
                    color="emerald"
                    delay={150}
                />
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
                                {pieData.map((_, i) => <Cell key={i} fill={_.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'IBM Plex Sans Thai', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-3">
                        {pieData.map((e, i) => (
                            <div key={e.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                                    <span className="text-slate-600">{e.name}</span>
                                </div>
                                <span className="font-mono font-medium text-slate-800">{e.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Work from home employee table */}
            <EmployeeList
                title="รายชื่อผู้ปฏิบัติงาน Work from Home"
                employees={workings}
            />

            <EmployeeList
                title="รายชื่อผู้ปฏิบัติงาน ณ สำนักงาน"
                employees={offices}
            />
        </div>
    )
}