'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import {
  BarChart3, LayoutDashboard, Upload,
  LogOut, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/upload', label: 'อัปโหลดข้อมูล', icon: Upload, roles: ['ADMIN', 'EDITOR'] },
]

interface SidebarProps {
  onItemClick?: () => void
}

export default function Sidebar({ onItemClick }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const userRole = (session?.user as { role: string })?.role

  return (
    <div className="flex flex-col h-full bg-white/30 backdrop-blur-xl border-r border-white/20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-white/10">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-slate-900 text-lg leading-tight tracking-tight">ConsultTrack</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">Management Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems
          .filter(item => !item.roles || (userRole && item.roles.includes(userRole)))
          .map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'glass-nav-active bg-slate-300/20 border-slate-300/30 shadow-md'
                    : 'glass-nav-idle'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span className={active ? 'font-semibold' : ''}>{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
              </Link>
            )
          })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xs font-bold">
              {session?.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">{session?.user?.name}</div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full w-fit ${
              userRole === 'ADMIN' ? 'bg-brand-500/10 text-brand-600 border border-brand-500/20' :
              userRole === 'EDITOR' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
              'bg-slate-500/10 text-slate-600 border border-slate-500/20'
            }`}>{userRole || 'VIEWER'}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 hover:bg-white/60 rounded-xl transition-all text-slate-400 hover:text-rose-500"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
