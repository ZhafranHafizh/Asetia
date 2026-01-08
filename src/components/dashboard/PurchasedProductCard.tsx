'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Download } from "lucide-react"
import { useState } from "react"

interface PurchasedProductCardProps {
    product: {
        id: string
        title: string
        price: number
        preview_url: string
        file_path: string
    }
    transactionStatus: string
}

export function PurchasedProductCard({ product, transactionStatus }: PurchasedProductCardProps) {
    const supabase = createClient()
    const [downloading, setDownloading] = useState(false)

    const imageUrl = product.preview_url?.startsWith('http')
        ? product.preview_url
        : supabase.storage.from('assets').getPublicUrl(product.preview_url).data.publicUrl

    const handleDownload = async () => {
        if (transactionStatus !== 'settlement') {
            alert('Download only available for completed purchases')
            return
        }

        setDownloading(true)
        try {
            // Get signed URL for private file
            const { data, error } = await supabase.storage
                .from('assets')
                .createSignedUrl(product.file_path, 3600) // 1 hour expiry

            if (error) throw error

            // Trigger download
            const link = document.createElement('a')
            link.href = data.signedUrl
            link.download = product.title
            link.click()
        } catch (error) {
            console.error('Download error:', error)
            alert('Failed to download file')
        } finally {
            setDownloading(false)
        }
    }

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
                <Button
                    onClick={handleDownload}
                    disabled={transactionStatus !== 'settlement' || downloading}
                    className="w-full bg-cyan-500 text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="mr-2 h-5 w-5" />
                    {downloading ? 'Downloading...' : 'Download Asset'}
                </Button>
            </CardFooter>
        </Card>
    )
}
