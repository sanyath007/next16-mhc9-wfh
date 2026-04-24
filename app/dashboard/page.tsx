'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users, GraduationCap, MapPin, CheckCircle2, RefreshCw,
  Building2, ChevronDown, ChevronRight, ArrowLeft,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { DashboardSummary, ConsultRecord } from '@/lib/types'
import { StatCard, ProgressBar, DistrictPanel } from '@/components/ui'
import { PIE_COLORS } from '@/lib/constants/dashboard'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ApiData {
  summary: DashboardSummary | null
  records: ConsultRecord[]
  uploadId: string
  years?: number[]             // available years for filtering
  selectedYear?: number        // year that was used for the data
}

export default function DashboardPage() {
  const [data, setData]               = useState<ApiData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | ''>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/data'
      if (selectedYear !== '') {
        url += `?year=${selectedYear}`
      }
      const res  = await fetch(url)
      const json = await res.json()
      setData(json)
      // sync selectedYear from server if not explicitly set
      if (selectedYear === '' && json.selectedYear) {
        setSelectedYear(json.selectedYear)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => { fetchData() }, [fetchData])

  // clear province filter when year changes so UI matches the dataset
  useEffect(() => {
    setSelectedProvince(null)
  }, [selectedYear])

  // ── Derived ────────────────────────────────────────────────────────────────
  const allRecords     = data?.records ?? []
  const provinceStats  = data?.summary?.provinceStats ?? []
  const summary        = data?.summary

  const provinceRecords = useMemo(() =>
    selectedProvince ? allRecords.filter(r => r.province === selectedProvince) : [],
    [allRecords, selectedProvince])

  const selectedProv = selectedProvince
    ? provinceStats.find(p => p.province === selectedProvince)
    : null

  const kpi = selectedProv
    ? {
        totalStudentsRequested: selectedProv.studentRequested,
        totalStudentsReceived:  selectedProv.studentReceived,
        totalStudentsCompleted: selectedProv.studentCompleted,
        overallCompletionRate:  selectedProv.completionRate,
      }
    : summary

  const pieData = [
    { name: 'สำเร็จแล้ว',          value: kpi?.totalStudentsCompleted ?? 0 },
    { name: 'อยู่ระหว่างดำเนินการ', value: (kpi?.totalStudentsReceived ?? 0) - (kpi?.totalStudentsCompleted ?? 0) },
    { name: 'ยังไม่ได้รับ',         value: (kpi?.totalStudentsRequested ?? 0) - (kpi?.totalStudentsReceived ?? 0) },
  ].filter(d => d.value > 0)

  const barData = useMemo(() => {
    if (!selectedProvince) {
      return provinceStats.map(p => ({
        name: p.province,
        ขอคำปรึกษา:   p.studentRequested,
        ได้รับคำปรึกษา: p.studentReceived,
        สำเร็จ:       p.studentCompleted,
      }))
    }

    return allRecords
      .filter(r => r.province === selectedProvince && r.level === 2)
      .map(r => ({
        name: r.district ?? '',
        ขอคำปรึกษา:   r.studentRequestedPerson,
        ได้รับคำปรึกษา: r.studentReceivedPerson,
        สำเร็จ:       r.studentCompletedPerson,
      }))
  }, [selectedProvince, provinceStats, allRecords])

  // ── Loading / empty states ──────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  )

  if (!summary) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
        <GraduationCap className="w-8 h-8 text-slate-400" />
      </div>
      <div className="text-center">
        <h3 className="font-display font-semibold text-slate-700">ยังไม่มีข้อมูล</h3>
        <p className="text-sm text-slate-500 mt-1">กรุณาอัปโหลดไฟล์ CSV เพื่อเริ่มต้น</p>
      </div>
      <a href="/upload" className="btn-primary">อัปโหลดข้อมูล</a>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {selectedProvince
              ? `จังหวัด${selectedProvince}`
              : 'รายงานผลงานการ Work from Home'}
            {selectedYear && (
              <span className="text-base font-normal text-slate-500 ml-2">({selectedYear})</span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* year filter */}
          <select
            value={selectedYear}
            onChange={e => {
              const v = e.target.value
              setSelectedYear(v === '' ? '' : parseInt(v, 10))
            }}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
          >
            <option value="">ปีล่าสุด</option>
            {data?.years?.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />รีเฟรช
          </button>
        </div>
      </div>

      {/* Province filter pills */}
      <div className="card px-4 py-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            จังหวัด
          </span>

          {/* All */}
          <button
            onClick={() => setSelectedProvince(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              !selectedProvince
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            ทั้งหมด
          </button>

          {/* Per province */}
          {provinceStats.map(p => {
            const active = selectedProvince === p.province
            return (
              <div key={p.province} className="relative group">
                <button
                  onClick={() => setSelectedProvince(active ? null : p.province)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {p.province}
                  {active && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
                </button>

                {/* Tooltip */}
                {!active && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30
                    bg-slate-900 text-white text-xs rounded-xl px-3.5 py-2 whitespace-nowrap
                    opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                    transition-all duration-150 shadow-xl"
                  >
                    {/* <p className="font-semibold text-white mb-1.5">{p.province}</p> */}
                    <div className="space-y-1 text-slate-300">
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
                    </div>
                    {/* Arrow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-[5px] border-transparent border-t-slate-900 w-0 h-0" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!selectedProvince ? (
          <>
            <StatCard icon={MapPin}        label="จังหวัด"     value={summary.totalProvinces}   color="brand"   delay={0} />
            <StatCard icon={Building2}     label="อำเภอ"       value={summary.totalDistricts}   color="brand"   delay={50} />
            <StatCard icon={GraduationCap} label="โรงเรียน"   value={summary.totalSchools}      color="emerald" delay={100} />
            <StatCard icon={Users}         label="Consultants" value={summary.totalConsultants} color="amber"   delay={150} />
          </>
        ) : (
          <>
            <StatCard icon={Building2}     label="อำเภอ"       value={selectedProv?.districtCount ?? 0}  color="brand"   delay={0} />
            <StatCard icon={GraduationCap} label="โรงเรียน"   value={selectedProv?.schoolCount ?? 0}     color="emerald" delay={50} />
            <StatCard icon={Users}         label="Consultants" value={selectedProv?.consultants ?? 0}    color="amber"   delay={100} />
            <StatCard
              icon={CheckCircle2}
              label="อัตราสำเร็จ"
              value={`${selectedProv?.completionRate ?? 0}%`}
              color={(selectedProv?.completionRate ?? 0) >= 70 ? 'emerald' : (selectedProv?.completionRate ?? 0) >= 40 ? 'amber' : 'rose'}
              delay={150}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-6 xl:col-span-2">
          <h3 className="font-display font-semibold text-slate-800 mb-5">
            {selectedProvince
              ? `สถิติรายอำเภอ — จ.${selectedProvince} (รายคน)`
              : 'สถิติรายจังหวัด (รายคน)'}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4} margin={{ bottom: selectedProvince ? 44 : 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={selectedProvince ? -30 : 0}
                textAnchor={selectedProvince ? 'end' : 'middle'}
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
              <Bar dataKey="ขอคำปรึกษา"   fill="#bae6fd" radius={[4,4,0,0]} />
              <Bar dataKey="ได้รับคำปรึกษา" fill="#38bdf8" radius={[4,4,0,0]} />
              <Bar dataKey="สำเร็จ"         fill="#0369a1" radius={[4,4,0,0]} />
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

      {/* Province overview table (no selection) */}
      {!selectedProvince && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-800">รายชื่อผู้ปฏิบัติงาน Work from Home</h3>
            <span className="text-xs text-slate-400">คลิกแถวเพื่อดูรายอำเภอ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['จังหวัด','Consultants','อำเภอ','โรงเรียน','ขอ (คน)','ได้รับ','สำเร็จ','อัตราสำเร็จ'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {provinceStats.map((p, i) => (
                  <tr
                    key={p.province}
                    className="hover:bg-brand-50/30 transition-colors cursor-pointer group animate-fadeInUp"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => setSelectedProvince(p.province)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{p.province}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-center">{p.consultants}</td>
                    <td className="px-5 py-4 text-slate-600 text-center">{p.districtCount}</td>
                    <td className="px-5 py-4 text-slate-600 text-center">{p.schoolCount}</td>
                    <td className="px-5 py-4 font-mono text-slate-700 text-right">{p.studentRequested.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-slate-700 text-right">{p.studentReceived.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-slate-700 text-right">{p.studentCompleted.toLocaleString()}</td>
                    <td className="px-5 py-4 min-w-35">
                      <ProgressBar value={p.studentCompleted} max={p.studentRequested} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* District drill-down */}
      {selectedProvince && (
        <div className="animate-fadeInUp">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setSelectedProvince(null)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> กลับไปภาพรวม
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span className="font-semibold text-slate-800">จังหวัด{selectedProvince}</span>
              <span className="text-slate-400">→ รายอำเภอ</span>
            </div>
          </div>
          <DistrictPanel records={provinceRecords} />
        </div>
      )}

    </div>
  )
}