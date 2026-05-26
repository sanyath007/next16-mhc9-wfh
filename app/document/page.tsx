"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";

export default function SignPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900">จัดการเอกสาร</h1>
                    <p className="text-sm text-slate-500 mt-1">จัดการเอกสารรายงานการปฏิบัติงาน Work From Home</p>
                </div>
            </div>

            <div className="flex justify-center max-md:flex-col gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                
            </div>
        </div>
    );
}

export function SignatureCanvas({ onSave }: { onSave: (dataUrl: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const padRef = useRef<SignaturePad | null>(null)

    useEffect(() => {
        padRef.current = new SignaturePad(canvasRef.current as HTMLCanvasElement, {
            backgroundColor: 'rgb(255,255,255)',
            penColor: 'rgb(0,0,0)',
        })
    }, [])

    const handleSave = () => {
        if (!padRef.current?.isEmpty()) {
            onSave(padRef.current!.toDataURL('image/png'))
        }
    }

    return (
        <>
            <canvas ref={canvasRef} width={500} height={200} className="border rounded" />
            <button onClick={() => padRef.current?.clear()}>Clear</button>
            <button onClick={handleSave}>Confirm Signature</button>
        </>
    )
}