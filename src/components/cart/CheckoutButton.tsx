'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { createBulkTransaction } from '@/app/checkout/actions'

interface CheckoutButtonProps {
    cartItemIds: string[]
    totalAmount: number
    itemCount: number
}

export function CheckoutButton({ cartItemIds, totalAmount, itemCount }: CheckoutButtonProps) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleCheckout = async () => {
        setIsProcessing(true)

        const result = await createBulkTransaction(cartItemIds)

        if (result.error) {
            alert('Failed to create checkout: ' + result.error)
            setIsProcessing(false)
        } else if (result.transactionId) {
            // Redirect to checkout page with transaction IDs
            const params = new URLSearchParams({
                ids: result.transactionIds?.join(',') || result.transactionId,
                bulk: 'true'
            })
            router.push(`/checkout/${result.transactionId}?${params.toString()}`)
        }
    }

    return (
        <Button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-cyan-500 text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-16 text-lg uppercase"
        >
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <ShoppingCart className="mr-2 h-6 w-6" />
                    Checkout Now ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </>
            )}
        </Button>
    )
}
