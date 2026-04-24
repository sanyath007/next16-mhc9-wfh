'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from '@/components/layouts/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-400/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full z-20">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 z-40 transform transition-transform duration-300 ease-out shadow-2xl ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full relative">
          <Sidebar onItemClick={() => setMobileOpen(false)} />
          {mobileOpen && (
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 -right-12 p-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2.5 bg-white/50 hover:bg-white/80 rounded-xl border border-white/40 shadow-sm transition-all active:scale-95">
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <span className="font-display font-bold text-slate-800 tracking-tight">ระบบรายงานผลงานการ Work from Home</span>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
