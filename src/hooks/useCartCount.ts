'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCartCount } from '@/app/cart/actions'

export function useCartCount() {
    const [count, setCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const refreshCount = useCallback(async () => {
        try {
            const { count: newCount } = await getCartCount()
            setCount(newCount)
        } catch (error) {
            console.error('Error fetching cart count:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshCount()
    }, [refreshCount])

    return { count, isLoading, refreshCount }
}
