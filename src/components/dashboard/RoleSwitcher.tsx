'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function RoleSwitcher() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') || 'buyer'
    const isSeller = mode === 'seller'

    const handleToggle = (checked: boolean) => {
        const newMode = checked ? 'seller' : 'buyer'
        const params = new URLSearchParams(searchParams.toString())
        params.set('mode', newMode)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center space-x-2 border-2 border-neo p-2 rounded-sm bg-background shadow-neo">
            <Switch
                id="role-mode"
                checked={isSeller}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-primary border-2 border-black"
            />
            <Label htmlFor="role-mode" className="font-bold uppercase cursor-pointer">
                {isSeller ? 'Seller Mode' : 'Buyer Mode'}
            </Label>
        </div>
    )
}
