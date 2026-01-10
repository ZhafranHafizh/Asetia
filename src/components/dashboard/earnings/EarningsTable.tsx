'use client'

import { memo } from 'react'

interface Transaction {
    id: string
    created_at: string
    price_at_purchase: number
    product: {
        title: string
    }
    status: string
}

interface EarningsTableProps {
    transactions: Transaction[]
    currentPage: number
    itemsPerPage: number
    onPageChange: (page: number) => void
}

function EarningsTableComponent({ transactions, currentPage, itemsPerPage, onPageChange }: EarningsTableProps) {

    const totalPages = Math.ceil(transactions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentTransactions = transactions.slice(startIndex, startIndex + itemsPerPage)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (transactions.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border-2 border-black rounded-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black text-white uppercase font-black tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b-2 border-black">Asset Name</th>
                            <th className="px-6 py-4 border-b-2 border-black">Price</th>
                            <th className="px-6 py-4 border-b-2 border-black">Date</th>
                            <th className="px-6 py-4 border-b-2 border-black">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y-2 divide-gray-100">
                        {currentTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold border-r border-gray-100">
                                    {tx.product?.title || 'Unknown Asset'}
                                </td>
                                <td className="px-6 py-4 border-r border-gray-100 font-mono">
                                    {formatCurrency(tx.price_at_purchase)}
                                </td>
                                <td className="px-6 py-4 border-r border-gray-100 text-gray-600">
                                    {formatDate(tx.created_at)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase border ${tx.status === 'settlement' || tx.status === 'capture'
                                            ? 'bg-green-100 text-green-800 border-green-600'
                                            : 'bg-yellow-100 text-yellow-800 border-yellow-600'
                                        }`}>
                                        {(tx.status === 'settlement' || tx.status === 'capture') ? 'Completed' : tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-gray-50 p-4 border-2 border-black rounded-sm gap-4">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border-2 border-black font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        Previous
                    </button>
                    <span className="font-bold text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border-2 border-black font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export const EarningsTable = memo(EarningsTableComponent)
