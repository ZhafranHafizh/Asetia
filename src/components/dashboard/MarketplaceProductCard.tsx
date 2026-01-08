'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, Star, Package } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createTransaction } from "@/app/checkout/actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface MarketplaceProductCardProps {
    product: {
        id: string
        title: string
        price: number
        preview_url: string
        category?: string
        sale_type?: string
        sold_to?: string
    }
    sellerName: string
}

export function MarketplaceProductCard({ product, sellerName }: MarketplaceProductCardProps) {
    const supabase = createClient()
    const router = useRouter()
    const [isPurchasing, setIsPurchasing] = useState(false)

    const imageUrl = product.preview_url?.startsWith('http')
        ? product.preview_url
        : supabase.storage.from('assets').getPublicUrl(product.preview_url).data.publicUrl

    const isOneTime = product.sale_type === 'one_time'
    const isSold = isOneTime && product.sold_to

    const handlePurchase = async () => {
        setIsPurchasing(true)
        const result = await createTransaction(product.id, product.price)

        if (result.error) {
            alert('Failed to create transaction: ' + result.error)
            setIsPurchasing(false)
        } else if (result.transactionId) {
            router.push(`/checkout/${result.transactionId}`)
        }
    }

    return (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-sm overflow-hidden flex flex-col h-full hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
            <div className="relative w-full h-48 border-b-2 border-black bg-gray-100">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-bold uppercase">
                        No Preview
                    </div>
                )}

                {/* Sale Type Badge */}
                <div className="absolute top-2 right-2">
                    {isOneTime ? (
                        <div className={`px-3 py-1 font-black uppercase text-xs border-2 border-black rounded-sm flex items-center gap-1 ${isSold ? 'bg-gray-400 text-white' : 'bg-yellow-400 text-black'}`}>
                            <Star className="h-3 w-3" />
                            {isSold ? 'SOLD' : 'EXCLUSIVE'}
                        </div>
                    ) : (
                        <div className="px-3 py-1 bg-green-400 text-black font-black uppercase text-xs border-2 border-black rounded-sm flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            UNLIMITED
                        </div>
                    )}
                </div>
            </div>

            <CardHeader className="p-4 pb-2 space-y-1">
                <h3 className="font-black text-lg uppercase leading-tight line-clamp-2">{product.title}</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase">{product.category || 'Uncategorized'}</p>
                <p className="text-xs font-bold text-gray-600">by {sellerName}</p>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-2xl font-black text-cyan-600" suppressHydrationWarning>
                    IDR {product.price.toLocaleString()}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                {isSold ? (
                    <Button
                        disabled
                        className="w-full bg-gray-300 text-gray-600 font-black border-2 border-black rounded-sm uppercase cursor-not-allowed"
                    >
                        Sold Out
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full bg-cyan-500 text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Buy Now
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-black uppercase text-2xl">Konfirmasi Pembelian</AlertDialogTitle>
                                <div className="space-y-4 pt-4">
                                    <div className="border-2 border-black p-4 rounded-sm bg-gray-50">
                                        <p className="font-bold text-black mb-2">Product:</p>
                                        <p className="text-lg font-black text-black">{product.title}</p>
                                        <p className="text-sm font-bold text-gray-600 mt-1">by {sellerName}</p>
                                        {isOneTime && (
                                            <div className="mt-3 p-2 bg-yellow-100 border-2 border-yellow-600 rounded-sm">
                                                <p className="text-xs font-black text-yellow-900 flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    EXCLUSIVE ONE-TIME SALE
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-2 border-black p-4 rounded-sm bg-cyan-50">
                                        <p className="font-bold text-black mb-2">Total Pembayaran:</p>
                                        <div className="text-2xl font-black text-cyan-600" suppressHydrationWarning>
                                            IDR {product.price.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-2 border-black rounded-sm font-bold uppercase">
                                    Batal
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handlePurchase}
                                    disabled={isPurchasing}
                                    className="bg-cyan-500 text-white border-2 border-black rounded-sm font-bold uppercase hover:bg-cyan-600"
                                >
                                    {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        </Card>
    )
}
