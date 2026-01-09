'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function RoleSwitcher() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Detect mode from query params OR from path (e.g., /dashboard/seller/*)
    const modeFromParams = searchParams.get('mode')
    const isSellerPath = pathname.startsWith('/dashboard/seller') || pathname.startsWith('/dashboard/products') || pathname.startsWith('/dashboard/earnings')
    const mode = modeFromParams || (isSellerPath ? 'seller' : 'buyer')
    const isSeller = mode === 'seller'

    const isLocked = pathname === '/dashboard/products/new'

    const handleToggle = (checked: boolean) => {
        if (isLocked) return
        const newMode = checked ? 'seller' : 'buyer'

        // If we're on a seller-specific path, redirect to dashboard with mode
        if (pathname.startsWith('/dashboard/seller')) {
            router.push(`/dashboard?mode=${newMode}`)
        } else {
            const params = new URLSearchParams(searchParams.toString())
            params.set('mode', newMode)
            router.push(`?${params.toString()}`)
        }
    }

    return (
        <div className={`flex items-center space-x-2 border-2 border-neo p-2 rounded-sm bg-background shadow-neo ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Switch
                id="role-mode"
                checked={isSeller}
                onCheckedChange={handleToggle}
                disabled={isLocked}
                className="data-[state=checked]:bg-primary border-2 border-black"
            />
            <Label htmlFor="role-mode" className="font-bold uppercase cursor-pointer">
                {isSeller ? 'Seller Mode' : 'Buyer Mode'}
            </Label>
        </div>
    )
}
