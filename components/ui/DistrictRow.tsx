import { ChevronDown, ChevronRight, School } from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import { completionRate, rateBadgeClass, rateColor } from '@/lib/utils/dashboard'
import type { ConsultRecord } from '@/lib/types'

type DistrictRowProps = {
    district: ConsultRecord
    schools: ConsultRecord[]
    isExpanded: boolean
    onToggle: () => void
}

export function DistrictRow({ district, schools, isExpanded, onToggle }: DistrictRowProps) {
    const rate = completionRate(district.studentCompletedPerson, district.studentRequestedPerson)

    return (
        <>
            <tr
                className={`cursor-pointer select-none transition-colors ${
                    isExpanded ? 'bg-brand-50/60' : 'hover:bg-slate-50/80'
                }`}
                onClick={onToggle}
            >
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

                <td className="px-4 py-3.5 min-w-32.5">
                    <ProgressBar value={district.studentCompletedPerson} max={district.studentRequestedPerson} />
                </td>

                <td className="px-4 py-3.5 font-mono text-sm text-slate-500 text-right">
                    {district.studentRequestedSession.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-emerald-600 text-right">
                    {district.studentCompletedSession.toLocaleString()}
                </td>
            </tr>

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

                    <tr>
                        <td colSpan={9} className="h-px bg-brand-100" />
                    </tr>
                </>
            )}
        </>
    )
}
