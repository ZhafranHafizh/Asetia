'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function RoleSwitcher() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Detect mode from query params OR from path
    const modeFromParams = searchParams.get('mode')
    const isSellerPath = pathname.startsWith('/dashboard/seller') || pathname.startsWith('/dashboard/products') || pathname.startsWith('/dashboard/earnings')
    const mode = modeFromParams || (isSellerPath ? 'seller' : 'buyer')
    const isSeller = mode === 'seller'

    const isLocked = pathname === '/dashboard/products/new'

    // Define buyer-only and seller-only routes
    const buyerOnlyRoutes = ['/dashboard/purchases', '/dashboard/cart']
    const sellerOnlyRoutes = ['/dashboard/seller', '/dashboard/products', '/dashboard/earnings']

    const isBuyerOnlyRoute = buyerOnlyRoutes.some(route => pathname.startsWith(route))
    const isSellerOnlyRoute = sellerOnlyRoutes.some(route => pathname.startsWith(route))

    const handleToggle = (checked: boolean) => {
        if (isLocked) return
        const newMode = checked ? 'seller' : 'buyer'

        // Automatic redirection based on mode and current route
        if (newMode === 'seller') {
            // Switching to Seller Mode - redirect to products page
            if (isBuyerOnlyRoute || pathname === '/dashboard') {
                router.push('/dashboard/products')
            } else {
                // Stay on current page with seller mode
                const params = new URLSearchParams(searchParams.toString())
                params.set('mode', 'seller')
                router.push(`${pathname}?${params.toString()}`)
            }
        } else {
            // Switching to Buyer Mode - redirect to main dashboard
            if (isSellerOnlyRoute) {
                router.push('/dashboard')
            } else {
                // Stay on current page with buyer mode
                const params = new URLSearchParams(searchParams.toString())
                params.set('mode', 'buyer')
                router.push(`${pathname}?${params.toString()}`)
            }
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
