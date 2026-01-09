'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { PurchaseDateGroup } from './PurchaseDateGroup'

interface PurchasesClientProps {
    groupedTransactions: Record<string, any[]>
}

export function PurchasesClient({ groupedTransactions }: PurchasesClientProps) {
    // Cache the date groups array to prevent re-computation
    const dateGroups = useMemo(() =>
        Object.entries(groupedTransactions),
        [groupedTransactions]
    )

    // Track which sections have been opened (for lazy rendering)
    const [openedSections, setOpenedSections] = useState<Set<string>>(() => {
        // First section is opened by default
        return new Set(dateGroups.length > 0 ? [dateGroups[0][0]] : [])
    })

    // Track expanded state
    const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
        return new Set(dateGroups.length > 0 ? [dateGroups[0][0]] : [])
    })

    // Single interval for all countdown timers
    const [currentTime, setCurrentTime] = useState(() => Date.now())

    useEffect(() => {
        // Update time every second for all countdowns
        const interval = setInterval(() => {
            setCurrentTime(Date.now())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleToggle = useCallback((date: string, isExpanding: boolean) => {
        if (isExpanding) {
            // Mark section as opened (for lazy rendering)
            setOpenedSections(prev => new Set([...prev, date]))
            setExpandedSections(prev => new Set([...prev, date]))
        } else {
            setExpandedSections(prev => {
                const next = new Set(prev)
                next.delete(date)
                return next
            })
        }
    }, [])

    if (dateGroups.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-sm opacity-60 bg-white">
                <h3 className="text-2xl font-black uppercase text-muted-foreground">No Purchases Yet</h3>
                <p className="font-medium text-muted-foreground mt-2">Start exploring the marketplace!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {dateGroups.map(([date, items], index) => (
                <PurchaseDateGroup
                    key={date}
                    date={date}
                    items={items}
                    isExpanded={expandedSections.has(date)}
                    shouldRender={openedSections.has(date)}
                    onToggle={handleToggle}
                    currentTime={currentTime}
                />
            ))}
        </div>
    )
}
