'use client'

import { memo } from 'react'
import { PurchaseItemRow } from './PurchaseItemRow'

interface PurchaseDateGroupProps {
    date: string
    items: any[]
    isExpanded: boolean
    shouldRender: boolean
    onToggle: (date: string, isExpanding: boolean) => void
    currentTime: number
}

function PurchaseDateGroupComponent({
    date,
    items,
    isExpanded,
    shouldRender,
    onToggle,
    currentTime
}: PurchaseDateGroupProps) {
    const handleToggle = () => {
        onToggle(date, !isExpanded)
    }

    return (
        <div className="border-2 border-black bg-white">
            {/* Header */}
            <button
                onClick={handleToggle}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-cyan-100 to-blue-100 border-b-2 border-black hover:from-cyan-200 hover:to-blue-200 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 border-2 border-black bg-white flex items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''
                        }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-black uppercase tracking-tight">{date}</h3>
                        <p className="text-sm font-bold text-gray-600">{items.length} Aset</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-black text-white font-black text-sm border-2 border-black">
                    {isExpanded ? 'TUTUP' : 'BUKA'}
                </div>
            </button>

            {/* Content - Lazy Rendered */}
            {isExpanded && shouldRender && (
                <div className="p-4 space-y-4 bg-gray-50">
                    {items.map((item: any) => (
                        <PurchaseItemRow
                            key={item.itemId || item.id}
                            transaction={item}
                            currentTime={currentTime}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Memoize to prevent unnecessary re-renders
export const PurchaseDateGroup = memo(PurchaseDateGroupComponent)
