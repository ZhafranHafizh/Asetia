'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { DownloadPolicyBadge } from "@/components/downloads/DownloadPolicyBadge"
import { DownloadButton } from "@/components/downloads/DownloadButton"

interface PurchasedProductCardProps {
    transactionId: string
    product: {
        id: string
        title: string
        price: number
        preview_url: string
        file_path: string
        download_policy?: 'unlimited' | 'once' | 'timed'
        download_duration_hours?: number
    }
    transactionStatus: string
    purchasedAt: string
}

export function PurchasedProductCard({
    transactionId,
    product,
    transactionStatus,
    purchasedAt
}: PurchasedProductCardProps) {
    const supabase = createClient()

    const imageUrl = product.preview_url?.startsWith('http')
        ? product.preview_url
        : supabase.storage.from('assets').getPublicUrl(product.preview_url).data.publicUrl

    return (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-sm overflow-hidden flex flex-col h-full bg-white">
            <div className="relative w-full h-48 border-b-2 border-black bg-gray-100">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-bold uppercase">
                        No Preview
                    </div>
                )}

                {/* Policy Badge Overlay */}
                <div className="absolute top-2 right-2">
                    <DownloadPolicyBadge
                        policy={product.download_policy || 'unlimited'}
                        duration={product.download_duration_hours}
                    />
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <h3 className="font-black text-lg uppercase leading-tight line-clamp-2">{product.title}</h3>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-xl font-black text-cyan-600" suppressHydrationWarning>
                    IDR {product.price.toLocaleString()}
                </p>
                <p className="text-xs font-bold text-gray-600 mt-1">
                    Status: <span className={transactionStatus === 'settlement' ? 'text-green-600' : 'text-yellow-600'}>
                        {transactionStatus.toUpperCase()}
                    </span>
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                {transactionStatus === 'settlement' ? (
                    <DownloadButton
                        transactionId={transactionId}
                        productTitle={product.title}
                        downloadPolicy={product.download_policy || 'unlimited'}
                        downloadDurationHours={product.download_duration_hours}
                        purchasedAt={purchasedAt}
                    />
                ) : (
                    <div className="w-full bg-yellow-100 text-yellow-800 font-bold border-2 border-yellow-600 p-2 rounded-sm text-center text-sm uppercase">
                        Payment Pending
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
