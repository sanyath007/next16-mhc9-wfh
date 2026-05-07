"use client";

import { useState } from "react";
import { MapPin, PhoneCall, Pencil, Trash2, X } from "lucide-react";
import Modal from "./modals/index";

interface Employee {
    id?: number;
    name: string;
    position: string;
    phone: string;
    email: string;
    address: {
        district: string;
        province: string;
    };
    tasks: string[];
}

interface EmployeeCardProps {
    employee: Employee;
    color?: 'brand' | 'emerald' | 'amber' | 'rose';
    delay?: number;
    onDelete?: (id: number) => Promise<void>;
}

const colors: Record<string, string> = {
    brand:   'bg-brand-500/10 text-brand-600 border border-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    amber:   'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    rose:    'bg-rose-500/10 text-rose-600 border border-rose-500/20',
};

export function EmployeeCard({
    employee,
    color = 'brand',
    delay = 0,
    onDelete
}: EmployeeCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!employee.id || !onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(employee.id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div
                className={`card p-4 flex flex-row gap-8 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-${color}-500/10 animate-fadeInUp`}
                style={{ animationDelay: `${delay}ms` }}
            >
                {/* Employee Info */}
                <div>
                    <div className="flex max-md:flex-col items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&size=80&background=1c1e2b&color=fff&bold=true`}
                                alt="User Avatar"
                                className="w-14 h-14 rounded-full ring-2 ring-white shadow-sm"
                            />
                            <div className="absolute bottom-1 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg text-slate-800">{employee.name}</h2>
                            <p className="text-sm text-slate-600">{employee.position}</p>

                            {/* Employee Contacts */}
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1 text-slate-500">
                                    <MapPin className="w-3 h-3 text-emerald-500" />
                                    <span className="text-xs">{employee.address.district}, {employee.address.province}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-500">
                                    <PhoneCall className="w-3 h-3 text-brand-500" />
                                    <span className="text-xs">{employee.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-auto">
                    <button className="p-2 rounded-lg bg-brand-500/10 text-brand-600 hover:bg-brand-500/20 transition-colors" title="แก้ไข">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors" 
                        title="ลบ"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="card p-6 max-w-sm w-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">ยืนยันการลบ</h3>
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <p className="text-slate-600 mb-6">
                        คุณต้องการลบรายการ Work from home<br />
                        ของ <span className="font-semibold text-slate-800">{employee.name}</span> หรือไม่?
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'กำลังลบ...' : 'ลบ'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
