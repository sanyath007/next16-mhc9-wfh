'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, BarChart3, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-fixed bg-gradient-to-br from-brand-50 via-slate-50 to-purple-50">
      {/* Background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-200/40 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-5xl flex rounded-[2.5rem] overflow-hidden glass shadow-2xl border border-white/50 min-h-[600px]">
        {/* Left decorative panel */}
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-brand-600/90 p-12 relative overflow-hidden backdrop-blur-xl">
          {/* Internal patterns */}
          <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-20" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-display font-bold text-2xl tracking-tight">MHC9 WFH</span>
            </div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Smart Monitoring System</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-white leading-tight mb-6">
              พัฒนาสู่การเป็น<br />องค์การดิจิทัล
            </h1>
            {/* <p className="text-brand-50/80 text-base leading-relaxed mb-8">
              ระบบวิเคราะห์ข้อมูลเชิงลึกสำหรับงานแนะแนว<br />
              เพื่อประสิทธิภาพสูงสุดในการดูแลนักเรียน
            </p> */}
          </div>

          <div className="relative z-10 text-white/40 text-xs font-medium tracking-widest uppercase">
            © 2024 MHC9
          </div>
        </div>

        {/* Right login form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white/40 backdrop-blur-xl">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex flex-col items-center mb-12">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30 mb-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display font-bold text-2xl text-slate-800">MHC9 WFH</h1>
            </div>

            <div className="mb-10">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">ยินดีต้อนรับ</h2>
              <p className="text-slate-500 font-medium">กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูลของคุณ</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  อีเมลผู้ใช้งาน
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field py-3.5 pl-4 pr-4 bg-white/60 hover:bg-white/80 focus:bg-white"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field py-3.5 pl-4 pr-12 bg-white/60 hover:bg-white/80 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-600 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3 animate-fadeInUp">
                  <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg font-bold shadow-xl flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {loading ? 'กำลังเข้าระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-200/50 text-center">
              <p className="text-sm text-slate-400 font-medium">
                ต้องการความช่วยเหลือ? <button className="text-brand-600 font-bold hover:underline">ติดต่อผู้ดูแลระบบ</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
