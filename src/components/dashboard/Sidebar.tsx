'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { RoleSwitcher } from './RoleSwitcher'
import { Button } from '@/components/ui/button'
import {
    ShoppingBag,
    LayoutDashboard,
    Package,
    DollarSign,
    Settings,
    LogOut,
    Home
} from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function Sidebar() {
    const router = useRouter()
    const supabase = createClient()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    // Detect mode from query params OR from path (e.g., /dashboard/seller/*)
    const modeFromParams = searchParams.get('mode')
    const isSellerPath = pathName.startsWith('/dashboard/seller') || pathName.startsWith('/dashboard/products') || pathName.startsWith('/dashboard/earnings')
    const mode = modeFromParams || (isSellerPath ? 'seller' : 'buyer')
    const isSeller = mode === 'seller'

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const links = isSeller
        ? [
            { name: 'Dashboard', href: '/dashboard?mode=seller', icon: LayoutDashboard },
            { name: 'My Products', href: '/dashboard/products?mode=seller', icon: Package },
            { name: 'Earnings', href: '/dashboard/earnings?mode=seller', icon: DollarSign },
            { name: 'Settings', href: '/dashboard/seller/settings', icon: Settings },
        ]
        : [
            { name: 'Marketplace', href: '/dashboard', icon: Home },
            { name: 'My Purchases', href: '/dashboard/purchases', icon: ShoppingBag },
            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ]

    return (
        <div className="w-64 border-r-2 border-neo bg-background h-screen flex flex-col p-4 fixed left-0 top-0">
            <div className="mb-8">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Asetia</h1>
                <RoleSwitcher />
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathName === link.href.split('?')[0]
                    return (
                        <Link key={link.href} href={link.href}>
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                className={`w-full justify-start border-2 rounded-sm uppercase font-bold text-left px-2 mb-1
                                    ${isActive
                                        ? `${isSeller ? 'bg-primary' : 'bg-cyan-400'} text-black border-black shadow-neo`
                                        : "border-transparent hover:border-neo hover:shadow-neo"
                                    }`}
                            >
                                <Icon className="mr-2 h-5 w-5" />
                                {link.name}
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto">
                <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-neo shadow-neo rounded-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
