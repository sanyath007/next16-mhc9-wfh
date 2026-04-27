'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, FileText, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react'

interface UploadRecord {
    id: string
    filename: string
    uploaded_at: string
    row_count: number
    year: number
    user: { name: string; email: string }
}

export default function UploadPage() {
    const { data: session } = useSession()
    const userRole = (session?.user as { role?: string })?.role
    const fileRef = useRef<HTMLInputElement>(null)

    const [dragging, setDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean; message?: string; rowCount?: number } | null>(null)
    const [history, setHistory] = useState<UploadRecord[]>([])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/upload')
            const json = await res.json()
            setHistory(json)
        } catch {}
    }

    useEffect(() => { fetchHistory() }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const dropped = e.dataTransfer.files[0]

        if (dropped?.name.endsWith('.pdf')) {
            setFile(dropped)
            setResult(null)
        }
    }, [])

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            setResult(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)
        setResult(null)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('user_id', `${session?.user?.id}`) // TODO: change to employee_id instead
        formData.append('work_date', new Date().toISOString())

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const json = await res.json()

            if (res.ok) {
                setResult({ success: true, message: 'อัปโหลดสำเร็จ', rowCount: json.rowCount })
                setFile(null)
                fetchHistory()
            } else {
                setResult({ success: false, message: json.error || 'เกิดข้อผิดพลาด' })
            }
        } catch {
            setResult({ success: false, message: 'ไม่สามารถเชื่อมต่อได้' })
        } finally {
            setUploading(false)
        }
    }

    const isReadOnly = userRole === 'VIEWER'

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">อัปโหลดรายงาน</h1>
                <p className="text-slate-500 mt-1 text-sm">นำเข้าไฟล์ PDF เพื่อส่งรายงานการ Work From Home</p>
            </div>

            {/* Viewer role message */}
            {isReadOnly && (
                <div className="flex items-center gap-3 p-5 bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-2xl text-amber-700 text-sm font-bold animate-fadeInUp">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    คุณมีสิทธิ์ Viewer ไม่สามารถอัปโหลดข้อมูลได้
                </div>
            )}

            {/* Upload zone */}
            <div className="card p-8 space-y-6">
                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !isReadOnly && fileRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                        isReadOnly
                            ? 'border-slate-200 bg-slate-100/30 opacity-60 cursor-not-allowed'
                            : dragging
                                ? 'border-brand-500 bg-brand-500/5 scale-[1.02] shadow-2xl shadow-brand-500/10'
                                : file
                                    ? 'border-emerald-500 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10'
                                    : 'border-slate-200 bg-white/30 hover:border-brand-400 hover:bg-brand-500/5 hover:shadow-xl hover:shadow-brand-500/5'
                    }`}
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFile}
                        className="hidden"
                        disabled={isReadOnly}
                    />
                    
                    {/* Decorative blobs inside dropzone */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -z-10" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-10" />

                    <div className="flex flex-col items-center gap-4 relative z-10">
                        {file ? (
                            <>
                                <div className="w-20 h-20 bg-emerald-500/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20 shadow-lg animate-countUp">
                                    <FileText className="w-10 h-10 text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-800 text-lg">{file.name}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); setFile(null) }}
                                    className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-700 transition-colors bg-rose-500/5 px-4 py-2 rounded-xl border border-rose-500/10"
                                >
                                    <X className="w-4 h-4" /> ลบไฟล์ออก
                                </button>
                            </>
                        ) : (
                            <>
                                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 shadow-lg ${
                                    dragging ? 'bg-brand-500 text-white scale-110 shadow-brand-500/30' : 'bg-white/80 text-slate-400 border border-white'
                                }`}>
                                    <Upload className={`w-10 h-10 ${dragging ? 'animate-bounce' : ''}`} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">
                                        {dragging ? 'วางไฟล์ที่นี่เพื่ออัปโหลด' : 'ลากและวางไฟล์ หรือคลิกเพื่อเลือก'}
                                    </p>
                                    <p className="text-sm font-medium text-slate-500 mt-2">รองรับเฉพาะ PDF ไฟล์ (Encoding: UTF-8 หรือ TIS-620)</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Result */}
                {result && (
                    <div className={`flex items-start gap-4 p-5 rounded-2xl text-sm font-bold border backdrop-blur-md animate-fadeInUp ${
                        result.success
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-700'
                    }`}>
                        <div className={`p-1.5 rounded-lg ${result.success ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                            {result.success 
                                ? <CheckCircle2 className="w-5 h-5" />
                                : <AlertCircle className="w-5 h-5" />
                            }
                        </div>
                        <div>
                            <p className="text-base">{result.message}</p>
                            {result.rowCount && <p className="mt-1 opacity-70 font-medium">นำเข้าข้อมูลสำเร็จทั้งหมด {result.rowCount.toLocaleString()} แถว</p>}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading || isReadOnly}
                    className="btn-primary w-full py-4 text-lg font-bold shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                            กำลังประมวลผลข้อมูล...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            อัปโหลดรายงาน
                        </>
                    )}
                </button>
            </div>

            {/* Upload history */}
            {history.length > 0 && (
                <div className="card overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="font-display font-semibold text-slate-800">ประวัติการอัปโหลด</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {history.map((upload, i) => (
                            <div key={upload.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                                <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-brand-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800 text-sm truncate">{upload.filename} ปีงบประมาณ {upload.year+543}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        โดย {/* {upload.user.name || upload.user.email} · {upload.row_count.toLocaleString()} แถว */}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {new Date(upload.uploaded_at).toLocaleDateString('th-TH', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                    {i === 0 && (
                                        <span className="badge bg-brand-100 text-brand-700 mt-1">ล่าสุด</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
