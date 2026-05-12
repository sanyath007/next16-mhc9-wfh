'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Users, MapPin, Building2, ChevronDown, House, AlertCircle, ArrowRight, Download, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { StatCard } from '@/components/ui'
import EmployeeList from './EmployeeList'
import DatePicker from '@/components/ui/forms/DatePicker'
import moment from 'moment'
import { useEmployees, useSchedules, useWorkings, useOverdueSchedules } from '@/lib/hooks/useWorking'
import WeeklyReportTemplate from '@/components/reports/WeeklyReportTemplate'
import { downloadPDF } from '@/lib/utils/pdf'
import { useRef } from 'react'

type DepartmentData = {
    name: string
    office: { count: number, lists: any }
    wfh: { count: number, lists: any }
    leave: { count: number, lists: any }
    trip: { count: number, lists: any }
    total: { count: number, lists: any }
}

export default function DashboardPage() {
    const { data: session } = useSession()
    const user = session?.user as any
    const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'EDITOR'

    const [trips, setTrips] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDep, setSelectedDep] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'))

    const [isExporting, setIsExporting] = useState(false)
    const [exportData, setExportData] = useState<any[]>([])
    const [exportRange, setExportRange] = useState({ start: '', end: '' })
    const reportRef = useRef<HTMLDivElement>(null)

    const { data: schedules } = useSchedules({ date: selectedDate })
    const { data: workings } = useWorkings({ schedules: schedules, dep: selectedDep })
    const { data: employees } = useEmployees()

    const handleExportWeekly = async () => {
        setIsExporting(true)
        try {
            const startOfWeek = moment(selectedDate).startOf('isoWeek').format('YYYY-MM-DD')
            const endOfWeek = moment(selectedDate).endOf('isoWeek').format('YYYY-MM-DD')
            setExportRange({ start: startOfWeek, end: endOfWeek })

            const response = await fetch(`/api/schedule?start_date=${startOfWeek}&end_date=${endOfWeek}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) throw new Error('Failed to fetch weekly schedules')

            const data = await response.json()
            
            // Group by employee
            const grouped = data.reduce((acc: any, curr: any) => {
                const empId = curr.employee_id
                if (!acc[empId]) {
                    acc[empId] = {
                        name: `${curr.employee.firstname} ${curr.employee.lastname}`,
                        position: curr.employee.position?.name || 'บุคลากร',
                        reported: true, // Start true, set false if any is not reported
                        dates: []
                    }
                }
                acc[empId].dates.push(parseInt(moment(curr.work_date).format('D')))
                if (!curr.reported) acc[empId].reported = false
                return acc
            }, {})

            const finalData = Object.values(grouped).map((item: any) => ({
                ...item,
                dates: item.dates.sort((a: number, b: number) => a - b)
            })).sort((a: any, b: any) => a.name.localeCompare(b.name, 'th'))
            setExportData(finalData)

            // Wait for render
            setTimeout(async () => {
                if (reportRef.current) {
                    await downloadPDF(reportRef.current, `รายงาน_WFH_สัปดาห์_${startOfWeek}_ถึง_${endOfWeek}.pdf`)
                }
                setIsExporting(false)
            }, 500)
        } catch (error) {
            console.error(error)
            setIsExporting(false)
        }
    }
    
    // Fetch overdue schedules for alert
    const { data: overdueSchedules } = useOverdueSchedules(
        !isAdminOrHR ? { employeeId: user?.employee_id?.toString() } : {}
    )

    const overdueCount = overdueSchedules?.length || 0

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
                (!workings?.some(w => w.id === parseInt(e.id)))
                && (!leaves?.filter((leave: any) => leave.type !== 'ชั่วโมง').some(l => l.employee?.id === parseInt(e.employee_no)))
                && (!trips?.some(t => t.id === parseInt(e.employee_no)))
        )
    }, [workings, leaves, trips])

    const departments = useMemo(() => {
        return ['อำนวยการ','วิชาการสุขภาพจิต','บริการสุขภาพจิต'].map(dep => ({
            name:   dep,
            office: {
                count:  offices?.filter((e: any) => (e.members[0]?.department?.name as string)?.includes(dep)).length,
                lists:  offices?.filter((e: any) => (e.members[0]?.department?.name as string)?.includes(dep))
            },
            wfh: {
                count:  workings?.filter((w: any) => (w.members[0]?.department?.name as string)?.includes(dep)).length || 0,
                lists:  workings?.filter((w: any) => (w.members[0]?.department?.name as string)?.includes(dep))
            },
            leave: {
                count:  leaves.filter((l: any) => l.type !== 'ชั่วโมง' && (l.employee?.department?.name as string)?.includes(dep)).length,
                lists:  employees?.filter((e: any) => 
                            leaves
                                .filter((l: any) => l.type !== 'ชั่วโมง' && (l.employee?.department?.name as string)?.includes(dep))
                                .some(l => l.employee?.id === parseInt(e.employee_no))
                        )
            },
            trip: {
                count:  trips.filter((t: any) => (t.department?.name as string).includes(dep)).length,
                lists:  employees?.filter((e: any) => 
                            trips
                                .filter((t: any) => (t.department?.name as string).includes(dep))
                                .some(t => t.id === parseInt(e.employee_no))
                        )
            },
            total: {
                count:  employees?.filter((e: any) => (e.members[0]?.department?.name as string)?.includes(dep)).length,
                lists:  employees?.filter((e: any) => (e.members[0]?.department?.name as string)?.includes(dep))
            }
        }))
    }, [selectedDate, selectedDep, offices, workings, leaves, trips])

    const stat = useMemo(() => {
        if (!selectedDep) {
            return {
                office: offices?.length || 0,
                wfh:    workings?.length || 0,
                leave:  leaves.filter((leave: any) => leave.type !== 'ชั่วโมง').length || 0,
                trip:   trips.length || 0,
                total:  employees?.length || 0,
            }
        }

        const dep = departments.find(dep => dep.name === selectedDep) as DepartmentData
        return {
            office:     dep?.office.count,
            wfh:        dep?.wfh.count,
            leave:      dep?.leave.count,
            trip:       dep?.trip.count,
            total:      dep?.total.count,
        }
    }, [selectedDep, departments])

    const pieData = useMemo(() => {
        if (!selectedDep) {
            return [
                { name: 'สำนักงาน', value: offices?.length ?? 0, color: '#3C9EDB' },
                { name: 'WFH', value: workings?.length ?? 0, color: '#f43f5e' },
                { name: 'ลา/ไปราชการ', value: (leaves.filter((leave: any) => leave.type !== 'ชั่วโมง').length ?? 0) + (trips.length ?? 0), color: '#5bcf8f' },
            ]
        }

        const dep = departments.find(dep => dep.name === selectedDep) as DepartmentData
        return [
            { name: 'สำนักงาน', value: dep.office.count, color: '#3C9EDB' },
            { name: 'WFH', value: dep.wfh.count, color: '#f43f5e' },
            { name: 'ลา/ไปราชการ', value: (dep.leave.count) + (dep.trip.count), color: '#5bcf8f' },
        ]
    }, [selectedDep, departments])

    const barData = useMemo(() => {
        if (!selectedDep) {
            return departments.map(el => ({
                name: el.name,
                'สำนักงาน': el.office.count,
                'WFH': el.wfh.count,
                'ลา/ไปราชการ': el.leave.count + el.trip.count,
            }))
        }

        return departments
                .filter(dep => dep.name === selectedDep)
                .map(el => ({
                    name: el.name,
                    'สำนักงาน': el.office.count,
                    'WFH': el.wfh.count,
                    'ลา/ไปราชการ': el.leave.count + el.trip.count,
                }))
    }, [selectedDep, departments])

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
                    {isAdminOrHR && (
                        <button
                            onClick={handleExportWeekly}
                            disabled={isExporting}
                            className="btn-primary py-2.5 px-4 flex items-center gap-2 whitespace-nowrap"
                            title="ส่งออกรายงานประจำสัปดาห์"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            <span className="max-lg:hidden">รายงานประจำสัปดาห์</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden Template for PDF Export */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <WeeklyReportTemplate 
                    ref={reportRef}
                    data={exportData}
                    startDate={exportRange.start}
                    endDate={exportRange.end}
                />
            </div>

            {/* Pending Reports Alert */}
            {overdueCount > 0 && (
                <div className="animate-fadeInUp">
                    <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2rem] p-6 shadow-xl shadow-brand-500/5 group">
                        {/* Decorative background blobs */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700" />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5 text-center md:text-left">
                                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-inner shrink-0">
                                    <AlertCircle className="w-7 h-7 text-rose-500 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                        {isAdminOrHR 
                                            ? `มีรายงานค้างส่งทั้งหมด ${overdueCount} รายการ`
                                            : `คุณมีรายงานที่ยังไม่ได้ส่ง ${overdueCount} รายการ`
                                        }
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1 font-medium">
                                        {isAdminOrHR
                                            ? 'กรุณาตรวจสอบและแจ้งเตือนบุคลากรให้ส่งรายงานการปฏิบัติงาน'
                                            : 'กรุณาอัปโหลดรายงานผลการปฏิบัติงานเพื่อให้ข้อมูลเป็นปัจจุบัน'
                                        }
                                    </p>
                                </div>
                            </div>

                            <Link 
                                href="/upload"
                                className="flex items-center gap-3 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:scale-[1.02] transition-all group/btn"
                            >
                                {isAdminOrHR ? 'จัดการรายงาน' : 'อัปโหลดเดี๋ยวนี้'}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

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
                <StatCard icon={Building2} label="สำนักงาน" value={stat.office!} color="brand" delay={50} />
                <StatCard icon={House} label="Work from Home" value={stat.wfh!} color="rose" delay={100} />
                <StatCard
                    icon={MapPin}
                    label="ลา/ไปราชการ"
                    value={stat.leave! + stat.trip! + ` (${tempLeaved})`}
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
                                <span className="font-mono font-medium text-slate-800">
                                    {e.value?.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Work at office lists */}
            <EmployeeList
                title="รายชื่อบุคลากรปฏิบัติงาน ณ สำนักงาน"
                employees={!selectedDep ? offices : departments.find(dep => dep.name === selectedDep)?.office.lists}
            />

            {/* Work from home lists */}
            <EmployeeList
                title="รายชื่อบุคลากรปฏิบัติงาน Work from Home"
                employees={!selectedDep ? workings : departments.find(dep => dep.name === selectedDep)?.wfh.lists}
                isReport
            />

            {/* Have business trip lists */}
            <EmployeeList
                title="รายชื่อบุคลากรไปราชการ"
                employees={!selectedDep
                    ? employees?.filter((e: any) => trips.some(t => t.id === parseInt(e.employee_no)))
                    : departments.find(dep => dep.name === selectedDep)?.trip.lists
                }
            />

            {/* Have leave lists */}
            <EmployeeList
                title="รายชื่อบุคลากรลา"
                employees={!selectedDep
                    ? employees?.filter((e: any) => leaves
                        .filter((leave: any) => leave.type !== 'ชั่วโมง')
                        .some(l => l.employee?.id === parseInt(e.employee_no)))
                    : departments.find(dep => dep.name === selectedDep)?.leave.lists
                }
            />
        </div>
    )
}