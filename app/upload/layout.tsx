import DashboardLayout from '@/app/dashboard/layout'
import { OCRProvider } from '@/lib/contexts/OCRContext'

export default function UploadLayout({ children }: { children: React.ReactNode }) {
    return (
        <OCRProvider>
            <DashboardLayout>{children}</DashboardLayout>
        </OCRProvider>
    )
}
