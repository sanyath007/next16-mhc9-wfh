"use client";

import { DocusealForm  } from "@docuseal/react";
import { useCallback, useEffect, useState } from "react";

export default function SchedulePage() {
    const [slug, setSlug] = useState('');

    const initForm = useCallback(() => {
            fetch('/api/docuseal/init_form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId: 1,
                    signerEmail: 'sanyath007@gmail.com',
                    signerName: null,
                })
            })
            .then(async (resp) => {
                const { slug } = await resp.json();
                console.log(slug);

                setSlug(slug);
            });
    }, []);

    const setEmail = useCallback(() => {
            fetch('/api/docuseal/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId: 1,
                    signerEmail: 'sanyath007@gmail.com',
                    signerName: null,
                })
            })
            .then(async (resp) => {
                const { slug } = await resp.json();
                console.log(slug);

                setSlug(slug);
            });
    }, []);

    useEffect(() => {
        initForm();
    }, []);

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
                {slug ? (
                    // <DocusealForm
                    //     host="localhost:9000"
                    //     src={`http://localhost:9000/s/${slug}`}
                    //     email="sanyath007@gmail.com"
                    //     onComplete={(data) => {
                    //         console.log('Form completed:', data);
                    //     }}
                    // />
                    // <iframe
                    //     src={`http://localhost:9000/s/${slug}`}
                    //     width="100%"
                    //     height="800px"
                    //     style={{ border: 'none' }}
                        
                    // />
                    <></>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500">กำลังเตรียมแบบฟอร์ม...</p>
                    </div>
                )}
            </div>
        </div>
    );
}