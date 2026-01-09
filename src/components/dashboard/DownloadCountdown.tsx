'use client'

import { memo, useMemo, useEffect, useState } from 'react'

interface DownloadCountdownProps {
    transactionTime: string
    durationHours: number
    currentTime: number
}

function DownloadCountdownComponent({ transactionTime, durationHours, currentTime }: DownloadCountdownProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const { timeLeft, isExpired } = useMemo(() => {
        if (!mounted) {
            return { timeLeft: 'Loading...', isExpired: false }
        }

        const purchaseDate = new Date(transactionTime)
        const expiryDate = new Date(purchaseDate.getTime() + durationHours * 60 * 60 * 1000)
        const diff = expiryDate.getTime() - currentTime

        if (diff <= 0) {
            return { timeLeft: 'Akses Berakhir', isExpired: true }
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        return {
            timeLeft: `${days}h ${hours}j ${minutes}m ${seconds}d`,
            isExpired: false
        }
    }, [transactionTime, durationHours, currentTime, mounted])

    if (!mounted) {
        // Return placeholder during SSR to match client initial render
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black font-bold text-sm bg-yellow-100 text-yellow-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black font-bold text-sm ${isExpired
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-900'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                {isExpired ? 'Akses Berakhir' : `Berakhir dalam: ${timeLeft}`}
            </span>
        </div>
    )
}

export const DownloadCountdown = memo(DownloadCountdownComponent)
