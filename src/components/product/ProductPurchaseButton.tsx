'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star, Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createTransaction } from '@/app/checkout/actions'

interface ProductPurchaseButtonProps {
    productId: string
    productPrice: number
    productTitle: string
    sellerName: string
    isExclusive: boolean
    isAuthenticated: boolean
}

export function ProductPurchaseButton({
    productId,
    productPrice,
    productTitle,
    sellerName,
    isExclusive,
    isAuthenticated
}: ProductPurchaseButtonProps) {
    const router = useRouter()
    const [isPurchasing, setIsPurchasing] = useState(false)

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setIsPurchasing(true)
        const result = await createTransaction(productId, productPrice)

        if (result.error) {
            alert('Failed to create transaction: ' + result.error)
            setIsPurchasing(false)
        } else if (result.transactionId) {
            router.push(`/checkout/${result.transactionId}`)
        }
    }

    if (!isAuthenticated) {
        return (
            <Button
                onClick={() => router.push('/login')}
                className="w-full bg-cyan-500 text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-16 text-lg uppercase"
            >
                <ShoppingCart className="mr-2 h-6 w-6" />
                Login to Purchase
            </Button>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="w-full bg-cyan-500 text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-16 text-lg uppercase">
                    <ShoppingCart className="mr-2 h-6 w-6" />
                    Buy Now
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-sm max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-black uppercase text-2xl">Confirm Purchase</AlertDialogTitle>
                    <div className="space-y-4 pt-4">
                        <div className="border-2 border-black p-4 rounded-sm bg-gray-50">
                            <p className="font-bold text-black mb-2">Product:</p>
                            <p className="text-lg font-black text-black">{productTitle}</p>
                            <p className="text-sm font-bold text-gray-600 mt-1">by {sellerName}</p>
                            {isExclusive && (
                                <div className="mt-3 p-2 bg-yellow-100 border-2 border-yellow-600 rounded-sm">
                                    <p className="text-xs font-black text-yellow-900 flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        EXCLUSIVE ONE-TIME SALE
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="border-2 border-black p-4 rounded-sm bg-cyan-50">
                            <p className="font-bold text-black mb-2">Total Payment:</p>
                            <div className="text-2xl font-black text-cyan-600" suppressHydrationWarning>
                                IDR {productPrice.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </AlertDialogHeader>
                <div className="flex gap-3 mt-4">
                    <AlertDialogCancel className="flex-1 border-2 border-black rounded-sm font-bold uppercase">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                        className="flex-1 bg-cyan-500 text-white border-2 border-black rounded-sm font-bold uppercase hover:bg-cyan-600"
                    >
                        {isPurchasing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Confirm'
                        )}
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
