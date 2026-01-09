'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface RouteGuardProps {
    children: React.ReactNode
    allowedMode: 'buyer' | 'seller'
    redirectTo?: string
}

export function RouteGuard({ children, allowedMode, redirectTo }: RouteGuardProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Detect current mode
        const modeFromParams = searchParams.get('mode')
        const isSellerPath = pathname.startsWith('/dashboard/seller') ||
            pathname.startsWith('/dashboard/products') ||
            pathname.startsWith('/dashboard/earnings')
        const currentMode = modeFromParams || (isSellerPath ? 'seller' : 'buyer')

        // Check if current mode matches allowed mode
        if (currentMode !== allowedMode) {
            const destination = redirectTo || (allowedMode === 'buyer' ? '/dashboard' : '/dashboard/products')
            router.push(destination)
        }
    }, [pathname, searchParams, allowedMode, redirectTo, router])

    return <>{children}</>
}
