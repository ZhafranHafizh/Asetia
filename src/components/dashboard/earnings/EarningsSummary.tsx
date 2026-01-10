'use client'

import { memo } from 'react'

interface EarningsSummaryProps {
    totalRevenue: number
    availableBalance: number
    totalSold: number
}

function EarningsSummaryComponent({ totalRevenue, availableBalance, totalSold }: EarningsSummaryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="bg-green-100 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h3 className="text-sm font-bold uppercase text-gray-600 mb-2">Total Revenue</h3>
                <p className="text-3xl font-black text-black tracking-tight">{formatCurrency(totalRevenue)}</p>
                <div className="mt-4 text-xs font-bold text-green-800 bg-green-200 inline-block px-2 py-1 border border-black rounded-sm">
                    All Time
                </div>
            </div>

            {/* Available Balance */}
            <div className="bg-yellow-100 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h3 className="text-sm font-bold uppercase text-gray-600 mb-2">Available Balance</h3>
                <p className="text-3xl font-black text-black tracking-tight">{formatCurrency(availableBalance)}</p>
                <div className="mt-4 text-xs font-bold text-yellow-800 bg-yellow-200 inline-block px-2 py-1 border border-black rounded-sm">
                    Ready to Withdraw
                </div>
            </div>

            {/* Total Assets Sold */}
            <div className="bg-blue-100 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h3 className="text-sm font-bold uppercase text-gray-600 mb-2">Assets Sold</h3>
                <p className="text-3xl font-black text-black tracking-tight">{totalSold}</p>
                <div className="mt-4 text-xs font-bold text-blue-800 bg-blue-200 inline-block px-2 py-1 border border-black rounded-sm">
                    Items Delivered
                </div>
            </div>
        </div>
    )
}

export const EarningsSummary = memo(EarningsSummaryComponent)
