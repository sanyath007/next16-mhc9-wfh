import { MapPin, PhoneCall } from "lucide-react";

interface Employee {
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
}

export function EmployeeCard({
    employee,
    color = 'brand',
    delay = 0
}: EmployeeCardProps) {
    const colors: Record<string, string> = {
        brand:   'bg-brand-500/10 text-brand-600 border border-brand-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
        amber:   'bg-amber-500/10 text-amber-600 border border-amber-500/20',
        rose:    'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    };

    return (
        <div
            className={`card p-6 flex flex-col gap-2 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-${color}-500/10 animate-fadeInUp`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Employee Info */}
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
                </div>
            </div>
            {/* Employee Contacts */}
            <div className="mb-2 space-y-2">
                <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs">{employee.address.district}, {employee.address.province}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                    <PhoneCall className="w-4 h-4 text-brand-500" />
                    <span className="text-xs">{employee.phone}</span>
                </div>
            </div>
            {/* Employee Tasks */}
            <div className="bg-slate-200 p-3 rounded-2xl">
                <h4 className="text-sm font-semibold text-slate-600">งานวันนี้:</h4>
                <p className="text-xs text-slate-600">{employee.tasks.join(', ')}</p>
            </div>
        </div>
    );
}
