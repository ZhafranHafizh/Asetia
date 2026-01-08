
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-muted/20">
            <Sidebar />
            <Header />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
