'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users, GraduationCap, MapPin, TrendingUp,
  CheckCircle2, XCircle, RefreshCw, Building2,
  ChevronDown, ChevronRight, School, ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { DashboardSummary } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConsultRecord {
  id: string
  sequence: string
  province: string
  district?: string
  school?: string
  level: number
  consultantCount: number
  studentRequestedPerson: number
  studentReceivedPerson: number
  studentNotReceivedPerson: number
  studentStartedPerson: number
  studentCompletedPerson: number
  studentRequestedSession: number
  studentReceivedSession: number
  studentNotReceivedSession: number
  studentStartedSession: number
  studentCompletedSession: number
}

interface ApiData {
  summary: DashboardSummary | null
  records: ConsultRecord[]
  uploadId: string
  years?: number[]             // available years for filtering
  selectedYear?: number        // year that was used for the data
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PIE_COLORS = ['#0ea5e9', '#f59e0b', '#f43f5e']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rateColor(rate: number) {
  if (rate >= 70) return '#10b981'
  if (rate >= 40) return '#f59e0b'
  return '#f43f5e'
}

function rateBadgeClass(rate: number) {
  if (rate >= 70) return 'bg-emerald-100 text-emerald-700'
  if (rate >= 40) return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
}

function completionRate(completed: number, requested: number) {
  return requested > 0 ? Math.round((completed / requested) * 100) : 0
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color = 'brand', delay = 0,
}: {
  icon: React.ElementType; label: string; value: number | string
  sub?: string; color?: string; delay?: number
}) {
  const colors: Record<string, string> = {
    brand:   'bg-brand-500/10 text-brand-600 border border-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    amber:   'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    rose:    'bg-rose-500/10 text-rose-600 border border-rose-500/20',
  }
  return (
    <div className="stat-card animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-3xl font-display font-bold text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-bold text-slate-500/80 uppercase tracking-wide mt-1">{label}</div>
        {sub && <div className="text-xs font-medium text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: rateColor(pct) }}
        />
      </div>
      <span className="text-xs font-mono text-slate-500 w-8 text-right shrink-0">
        {Math.round(pct)}%
      </span>
    </div>
  )
}

// ─── District expandable row ──────────────────────────────────────────────────

function DistrictRow({
  district, schools, isExpanded, onToggle,
}: {
  district: ConsultRecord
  schools: ConsultRecord[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const rate = completionRate(district.studentCompletedPerson, district.studentRequestedPerson)

  return (
    <>
      <tr
        className={`cursor-pointer select-none transition-colors ${
          isExpanded ? 'bg-brand-50/60' : 'hover:bg-slate-50/80'
        }`}
        onClick={onToggle}
      >
        {/* District name */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              isExpanded ? 'bg-brand-200 rotate-0' : 'bg-slate-100'
            }`}>
              {isExpanded
                ? <ChevronDown className="w-3.5 h-3.5 text-brand-700" />
                : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </div>
            <span className="font-medium text-slate-800 text-sm">{district.district}</span>
            {schools.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono transition-colors ${
                isExpanded ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {schools.length} รร.
              </span>
            )}
          </div>
        </td>

        {/* Numeric columns */}
        <td className="px-4 py-3.5 font-mono text-sm text-slate-600 text-right">
          {district.studentRequestedPerson.toLocaleString()}
        </td>
        <td className="px-4 py-3.5 font-mono text-sm text-sky-700 text-right">
          {district.studentReceivedPerson.toLocaleString()}
        </td>
        <td className="px-4 py-3.5 font-mono text-sm text-amber-700 text-right">
          {district.studentStartedPerson.toLocaleString()}
        </td>
        <td className="px-4 py-3.5 font-mono text-sm text-emerald-700 text-right">
          {district.studentCompletedPerson.toLocaleString()}
        </td>
        <td className="px-4 py-3.5 font-mono text-sm text-rose-600 text-right">
          {district.studentNotReceivedPerson.toLocaleString()}
        </td>

        {/* Progress */}
        <td className="px-4 py-3.5 min-w-[130px]">
          <ProgressBar value={district.studentCompletedPerson} max={district.studentRequestedPerson} />
        </td>

        {/* Session columns */}
        <td className="px-4 py-3.5 font-mono text-sm text-slate-500 text-right">
          {district.studentRequestedSession.toLocaleString()}
        </td>
        <td className="px-4 py-3.5 font-mono text-sm text-emerald-600 text-right">
          {district.studentCompletedSession.toLocaleString()}
        </td>
      </tr>

      {/* ── Expanded school rows ─────────────────────────────────────────── */}
      {isExpanded && (
        <>
          {schools.length === 0 ? (
            <tr className="bg-slate-50/50">
              <td colSpan={9} className="pl-16 pr-5 py-3 text-xs text-slate-400 italic">
                ไม่พบข้อมูลโรงเรียนในอำเภอนี้
              </td>
            </tr>
          ) : (
            schools.map((school, si) => {
              const sRate = completionRate(school.studentCompletedPerson, school.studentRequestedPerson)
              return (
                <tr
                  key={school.id}
                  className="bg-brand-50/25 border-l-2 border-brand-200 animate-fadeInUp"
                  style={{ animationDelay: `${si * 25}ms` }}
                >
                  <td className="pl-14 pr-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <School className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                      <span className="text-sm text-slate-700">{school.school}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500 text-right">
                    {school.studentRequestedPerson}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-sky-600 text-right">
                    {school.studentReceivedPerson}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-amber-600 text-right">
                    {school.studentStartedPerson}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-emerald-600 text-right">
                    {school.studentCompletedPerson}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-rose-500 text-right">
                    {school.studentNotReceivedPerson}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${sRate}%`, backgroundColor: rateColor(sRate) }}
                        />
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${rateBadgeClass(sRate)}`}>
                        {sRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400 text-right">
                    {school.studentRequestedSession}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-emerald-500 text-right">
                    {school.studentCompletedSession}
                  </td>
                </tr>
              )
            })
          )}

          {/* Separator */}
          <tr>
            <td colSpan={9} className="h-px bg-brand-100" />
          </tr>
        </>
      )}
    </>
  )
}

// ─── District panel ───────────────────────────────────────────────────────────

function DistrictPanel({ records }: { records: ConsultRecord[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const districtRows = useMemo(() =>
    records
      .filter(r => r.level === 2)
      .sort((a, b) => (a.district ?? '').localeCompare(b.district ?? '', 'th')),
    [records])

  const schoolMap = useMemo(() => {
    const map: Record<string, ConsultRecord[]> = {}
    records.filter(r => r.level === 3).forEach(r => {
      const key = r.district ?? ''
      if (!map[key]) map[key] = []
      map[key].push(r)
    })
    return map
  }, [records])

  const toggle = (d: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(d) ? n.delete(d) : n.add(d); return n })

  const expandAll = () => setExpanded(new Set(districtRows.map(r => r.district ?? '')))
  const collapseAll = () => setExpanded(new Set())

  // Totals
  const totals = useMemo(() => districtRows.reduce((acc, r) => ({
    req:  acc.req  + r.studentRequestedPerson,
    recv: acc.recv + r.studentReceivedPerson,
    strt: acc.strt + r.studentStartedPerson,
    done: acc.done + r.studentCompletedPerson,
    no:   acc.no   + r.studentNotReceivedPerson,
    reqS: acc.reqS + r.studentRequestedSession,
    doneS:acc.doneS+ r.studentCompletedSession,
  }), { req:0, recv:0, strt:0, done:0, no:0, reqS:0, doneS:0 }), [districtRows])

  // Bar data
  const barData = districtRows.map(r => ({
    name: r.district ?? '',
    ขอ:    r.studentRequestedPerson,
    สำเร็จ: r.studentCompletedPerson,
    ไม่รับ: r.studentNotReceivedPerson,
  }))

  if (districtRows.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-400 flex flex-col items-center gap-3">
        <AlertTriangle className="w-8 h-8 opacity-40" />
        <p className="text-sm">ไม่พบข้อมูลระดับอำเภอในจังหวัดนี้</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* District bar chart */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-800 mb-5">
          เปรียบเทียบสถิติรายอำเภอ (รายคน)
        </h3>
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={barData} barGap={3} margin={{ bottom: 48, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              angle={-35}
              textAnchor="end"
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
            <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
            <Bar dataKey="ขอ"    fill="#bae6fd" radius={[3,3,0,0]} />
            <Bar dataKey="สำเร็จ" fill="#0369a1" radius={[3,3,0,0]} />
            <Bar dataKey="ไม่รับ" fill="#fda4af" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* District detail table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-display font-semibold text-slate-800">รายละเอียดรายอำเภอ</h3>
            <p className="text-xs text-slate-400 mt-0.5">คลิกแถวเพื่อดูข้อมูลรายโรงเรียน</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
            >
              ขยายทั้งหมด
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button
              onClick={collapseAll}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ยุบทั้งหมด
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap">
                  อำเภอ
                </th>
                {[
                  { label: 'ขอ (คน)',   cls: 'text-slate-500' },
                  { label: 'รับแล้ว',  cls: 'text-sky-600' },
                  { label: 'เริ่มแล้ว',cls: 'text-amber-600' },
                  { label: 'สำเร็จ',   cls: 'text-emerald-600' },
                  { label: 'ไม่รับ',   cls: 'text-rose-600' },
                  { label: 'อัตราสำเร็จ', cls: 'text-slate-500' },
                  { label: 'ขอ (ครั้ง)',  cls: 'text-slate-500' },
                  { label: 'สำเร็จ (ครั้ง)', cls: 'text-emerald-600' },
                ].map(({ label, cls }) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-xs font-semibold tracking-wide text-right whitespace-nowrap ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {districtRows.map(dr => (
                <DistrictRow
                  key={dr.id}
                  district={dr}
                  schools={schoolMap[dr.district ?? ''] ?? []}
                  isExpanded={expanded.has(dr.district ?? '')}
                  onToggle={() => toggle(dr.district ?? '')}
                />
              ))}
            </tbody>

            {/* Totals footer */}
            <tfoot>
              <tr className="bg-gradient-to-r from-brand-50 to-brand-100/50 border-t-2 border-brand-200">
                <td className="px-5 py-3 text-sm font-semibold text-brand-800">
                  รวม {districtRows.length} อำเภอ
                </td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-slate-700 text-right">{totals.req.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-sky-700 text-right">{totals.recv.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-amber-700 text-right">{totals.strt.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-emerald-700 text-right">{totals.done.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-rose-600 text-right">{totals.no.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${completionRate(totals.done, totals.req)}%`,
                          backgroundColor: rateColor(completionRate(totals.done, totals.req)),
                        }}
                      />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${rateBadgeClass(completionRate(totals.done, totals.req))}`}>
                      {completionRate(totals.done, totals.req)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-slate-600 text-right">{totals.reqS.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-emerald-700 text-right">{totals.doneS.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {selectedProvince
              ? `จังหวัด${selectedProvince}`
              : 'ภาพรวมสถิติการให้คำปรึกษา'}
            {selectedYear && (
              <span className="text-base font-normal text-slate-500 ml-2">({selectedYear})</span>
            )}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {selectedProvince
              ? `${selectedProv?.districtCount ?? 0} อำเภอ · ${selectedProv?.schoolCount ?? 0} โรงเรียน · Consultant ${selectedProv?.consultants ?? 0} คน${selectedYear ? ` · ปี ${selectedYear}` : ''}`
              : selectedYear
                ? `ข้อมูลปี ${selectedYear}`
                : 'ข้อมูล ณ การอัปโหลดล่าสุด'}
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp}   label="นักเรียนขอคำปรึกษา" value={kpi?.totalStudentsRequested ?? 0} sub="จำนวนทั้งหมด (รายคน)"               color="brand"   delay={200} />
        <StatCard icon={CheckCircle2} label="ให้คำปรึกษาสำเร็จ"   value={kpi?.totalStudentsCompleted ?? 0} sub={`${kpi?.overallCompletionRate ?? 0}% ของที่ขอมา`} color="emerald" delay={250} />
        <StatCard icon={XCircle}      label="ยังไม่ได้รับคำปรึกษา" value={(kpi?.totalStudentsRequested ?? 0) - (kpi?.totalStudentsReceived ?? 0)} sub="รอการดำเนินการ" color="rose" delay={300} />
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
            <h3 className="font-display font-semibold text-slate-800">รายละเอียดรายจังหวัด</h3>
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
                    <td className="px-5 py-4 min-w-[140px]">
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