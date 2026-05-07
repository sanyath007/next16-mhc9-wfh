"use client";

import { useState } from "react";
import moment from "moment";
import { MapPin, PhoneCall, Pencil, Trash2, X } from "lucide-react";
import Modal from "./modals/index";
import DatePicker from "./forms/DatePicker";

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
    schedule?: {
        id: string;
        work_date: string;
        employee_id: number;
    };
    color?: 'brand' | 'emerald' | 'amber' | 'rose';
    delay?: number;
    onDelete?: (id: string) => Promise<void>;
    onEdit?: (id: string, data: { work_date: string; employee_id: number }) => Promise<void>;
}

const colors: Record<string, string> = {
    brand:   'bg-brand-500/10 text-brand-600 border border-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    amber:   'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    rose:    'bg-rose-500/10 text-rose-600 border border-rose-500/20',
};

export function EmployeeCard({
    employee,
    schedule,
    color = 'brand',
    delay = 0,
    onDelete,
    onEdit
}: EmployeeCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        id: schedule?.id || '',
        work_date: schedule?.work_date || '',
        employee_id: schedule?.employee_id || 0
    });

    const handleDelete = async () => {
        if (!schedule || !onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(schedule.id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditSubmit = () => {
        setShowEditModal(false);
        setShowConfirmModal(true);
    };

    const handleConfirmEdit = async () => {
        if (!onEdit) return;

        setIsEditing(true);
        try {
            await onEdit(editData.id, editData);
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Edit error:', error);
        } finally {
            setIsEditing(false);
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
                    <div className="flex items-center gap-3">
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
                    <button 
                        className="p-2 rounded-lg bg-brand-500/10 text-brand-600 hover:bg-brand-500/20 transition-colors" 
                        title="แก้ไข"
                        onClick={() => setShowEditModal(true)}
                    >
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

            {/* Edit Form Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                <div className="card p-6 min-w-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">แก้ไขตารางงาน</h3>
                        <button 
                            onClick={() => setShowEditModal(false)}
                            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">วันที่</label>
                            <DatePicker
                                value={editData.work_date}
                                onChange={(date) => setEditData({ ...editData, work_date: date })}
                                inputCss="border-slate-200 hover:border-slate-300 hover:shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">บุคลากร</label>
                            <p className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700">
                                {employee.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={() => setShowEditModal(false)}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button 
                            onClick={handleEditSubmit}
                            className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                        >
                            ต่อไป
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Confirmation Modal */}
            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                <div className="card p-6 max-w-sm w-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">ยืนยันการแก้ไข</h3>
                        <button 
                            onClick={() => setShowConfirmModal(false)}
                            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <p className="text-slate-600 mb-4">
                        คุณต้องการแก้ไขตารางงานของ <span className="font-semibold text-slate-800">{employee.name}</span> หรือไม่?
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-600">
                            วันที่: <span className="font-medium text-slate-800">
                                {moment(editData.work_date).locale('th').format('D MMMM') + ' ' + (moment(editData.work_date).year() + 543)}
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button 
                            onClick={handleConfirmEdit}
                            disabled={isEditing}
                            className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEditing ? 'กำลังบันทึก...' : 'ยืนยัน'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
