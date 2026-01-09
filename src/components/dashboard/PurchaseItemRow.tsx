'use client'

import { memo } from 'react'
import Image from 'next/image'
import { DownloadButton } from '@/components/downloads/DownloadButton'
import { DownloadCountdown } from '@/components/dashboard/DownloadCountdown'
import { Download, Infinity as InfinityIcon } from 'lucide-react'

interface PurchaseItemRowProps {
    transaction: {
        id: string
        created_at: string
        status: string
        amount: number
        is_downloaded: boolean
        product: {
            id: string
            title: string
            category: string
            download_policy: 'unlimited' | 'once' | 'timed'
            download_duration_hours?: number
        }
        seller?: {
            store_name?: string
            full_name?: string
            store_logo?: string
        }
    }
    currentTime: number
}

function PurchaseItemRowComponent({ transaction, currentTime }: PurchaseItemRowProps) {
    const { product, seller } = transaction

    if (!product) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-sm p-4">
                <p className="text-red-500 font-bold">Product data unavailable</p>
            </div>
        )
    }

    const renderStatusBadge = () => {
        const policy = product.download_policy || 'unlimited'

        if (policy === 'unlimited') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-green-100 text-green-800 border-2 border-green-600">
                    <InfinityIcon className="w-3 h-3" />
                    Akses Selamanya
                </span>
            )
        }

        if (policy === 'once') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-yellow-100 text-yellow-800 border-2 border-yellow-600">
                    <Download className="w-3 h-3" />
                    Sekali Unduh
                </span>
            )
        }

        if (policy === 'timed') {
            return (
                <DownloadCountdown
                    transactionTime={transaction.created_at}
                    durationHours={product.download_duration_hours || 0}
                    currentTime={currentTime}
                />
            )
        }
    }

    const storeName = seller?.store_name || seller?.full_name || 'Unknown Seller'
    const logoUrl = seller?.store_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${seller.store_logo}`
        : null

    return (
        <div className="bg-white border-2 border-black rounded-sm p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 space-y-3 w-full">
                    {/* Store Header */}
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-dashed border-gray-200 w-full">
                        {logoUrl ? (
                            <div className="relative w-6 h-6 border-2 border-black rounded-full overflow-hidden bg-white">
                                <Image
                                    src={logoUrl}
                                    alt={storeName}
                                    fill
                                    sizes="24px"
                                    className="object-cover"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div className="w-6 h-6 border-2 border-black rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                <span className="text-white text-xs font-black">
                                    {storeName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="font-bold text-sm uppercase text-gray-600">
                            {storeName}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                            <h3 className="font-black text-lg uppercase leading-tight line-clamp-1">
                                {product.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded-sm border border-gray-300">
                                    {product.category || 'Asset'}
                                </span>
                                {renderStatusBadge()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto min-w-[180px] flex flex-col gap-2">
                    <DownloadButton
                        transactionId={transaction.id}
                        productTitle={product.title}
                        downloadPolicy={product.download_policy || 'unlimited'}
                        downloadDurationHours={product.download_duration_hours}
                        purchasedAt={transaction.created_at}
                        isDownloaded={transaction.is_downloaded}
                    />
                </div>
            </div>
        </div>
    )
}

export const PurchaseItemRow = memo(PurchaseItemRowComponent)
