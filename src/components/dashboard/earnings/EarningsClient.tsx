'use client'

import { useState, useMemo } from 'react'
import { EarningsSummary } from './EarningsSummary'
import { EarningsTable } from './EarningsTable'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Transaction {
    id: string
    created_at: string
    price_at_purchase: number
    product: {
        title: string
    }
    status: string
}

interface EarningsClientProps {
    transactions: Transaction[]
    initialStats?: {
        totalRevenue: number
        totalSold: number
        activeProducts: number
    }
}

export function EarningsClient({ transactions, initialStats }: EarningsClientProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const { totalRevenue, totalSold, availableBalance } = useMemo(() => {
        // If initialStats is provided (from reliable View), use it.
        if (initialStats) {
            return {
                totalRevenue: initialStats.totalRevenue,
                availableBalance: initialStats.totalRevenue, // Assuming all revenue is available
                totalSold: initialStats.totalSold
            }
        }

        // Fallback to manual calculation
        const completed = transactions.filter(t => t.status === 'settlement' || t.status === 'capture')
        const revenue = completed.reduce((sum, t) => sum + t.price_at_purchase, 0)
        return {
            totalRevenue: revenue,
            availableBalance: revenue,
            totalSold: completed.length
        }
    }, [transactions, initialStats])

    const hasTransactions = transactions.length > 0

    if (!hasTransactions) {
        return (
            <div className="space-y-8">
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-sm bg-white">
                    <h3 className="text-2xl font-black uppercase text-muted-foreground">No Earnings Yet</h3>
                    <p className="font-medium text-muted-foreground mt-2 mb-6">Start selling your digital assets to earn money!</p>
                    <Link
                        href="/dashboard/products/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Upload Asset
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Earnings</h1>
                    <p className="text-muted-foreground font-medium mt-2">
                        Track your revenue and sales performance
                    </p>
                </div>
                <button
                    disabled
                    className="w-full md:w-auto px-6 py-3 bg-black text-white font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] opacity-70 cursor-not-allowed"
                >
                    Withdraw Funds (Coming Soon)
                </button>
            </div>

            <EarningsSummary
                totalRevenue={totalRevenue}
                availableBalance={availableBalance}
                totalSold={totalSold}
            />

            <div>
                <h3 className="text-xl font-black uppercase mb-4 pl-1 border-l-4 border-black">
                    Transaction History
                </h3>
                <EarningsTable
                    transactions={transactions}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    )
}
