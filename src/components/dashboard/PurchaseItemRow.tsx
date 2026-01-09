'use client'

import { StoreAvatar } from '@/components/shared/StoreAvatar'
import { DownloadButton } from '@/components/downloads/DownloadButton'
import { Clock, Download, Infinity as InfinityIcon } from 'lucide-react'

interface PurchaseItemRowProps {
    transaction: {
        id: string
        created_at: string
        updated_at: string
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
}

export function PurchaseItemRow({ transaction }: PurchaseItemRowProps) {
    const { product, seller } = transaction

    // Safety check for missing product data (e.g. hard delete or fetch error)
    if (!product) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-sm p-4">
                <p className="text-red-500 font-bold">Product data unavailable for this transaction ({transaction.id.slice(0, 8)}...)</p>
            </div>
        )
    }

    // Determine Status Badge
    const renderStatusBadge = () => {
        // Default to 'unlimited' if policy is null/undefined (e.g. legacy data)
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
            const purchasedAt = new Date(transaction.updated_at)
            const duration = product.download_duration_hours || 0
            const expiresAt = new Date(purchasedAt.getTime() + duration * 60 * 60 * 1000)

            const formattedDate = expiresAt.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })

            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-blue-100 text-blue-800 border-2 border-blue-600">
                    <Clock className="w-3 h-3" />
                    Berlaku s/d {formattedDate}
                </span>
            )
        }
    }

    return (
        <div className="bg-white border-2 border-black rounded-sm p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">

                {/* Store Info & Product Main */}
                <div className="flex-1 space-y-3 w-full">
                    {/* Store Header */}
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-dashed border-gray-200 w-full">
                        <StoreAvatar
                            storeName={seller?.store_name || seller?.full_name || 'Seller'}
                            logoUrl={seller?.store_logo ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${seller.store_logo}` : null}
                            size="xs"
                        />
                        <span className="font-bold text-sm uppercase text-gray-600">
                            {seller?.store_name || seller?.full_name || 'Unknown Seller'}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                            <h3 className="font-black text-lg uppercase leading-tight line-clamp-1">{product.title}</h3>
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
                        purchasedAt={transaction.updated_at}
                        isDownloaded={transaction.is_downloaded}
                    />
                </div>
            </div>
        </div>
    )
}
