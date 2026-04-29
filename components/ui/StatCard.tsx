import type { ElementType } from 'react'

type StatCardProps = {
    icon: ElementType
    label: string
    value: number | string
    sub?: string
    color?: string
    delay?: number
}

export function StatCard({
    icon: Icon, label, value, sub, color = 'brand', delay = 0,
}: StatCardProps) {
    const colors: Record<string, string> = {
        brand:   'bg-brand-500/10 text-brand-600 border border-brand-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
        amber:   'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        rose:    'bg-rose-500/10 text-rose-600 border border-rose-500/20',
        indigo:  'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
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
