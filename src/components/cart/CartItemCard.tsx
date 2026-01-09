'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeFromCart } from '@/app/cart/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CartItemCardProps {
    item: {
        id: string
        product: {
            id: string
            title: string
            price: number
            preview_url: string | null
            category: string
            seller: {
                full_name: string
                store_name: string | null
            }
        }
    }
}

export function CartItemCard({ item }: CartItemCardProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isRemoving, setIsRemoving] = useState(false)

    const handleRemove = async () => {
        setIsRemoving(true)
        const result = await removeFromCart(item.id)

        if (result.error) {
            alert('Failed to remove item: ' + result.error)
            setIsRemoving(false)
        } else {
            router.refresh()
        }
    }

    const sellerName = item.product.seller.store_name || item.product.seller.full_name

    // Properly construct image URL
    const getImageUrl = () => {
        if (!item.product.preview_url) return null

        // If it's already a full URL, use it
        if (item.product.preview_url.startsWith('http')) {
            return item.product.preview_url
        }

        // Otherwise, construct Supabase storage URL
        return supabase.storage.from('assets').getPublicUrl(item.product.preview_url).data.publicUrl
    }

    const imageUrl = getImageUrl()

    return (
        <div className="border-4 border-black rounded-sm bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex gap-4 p-4">
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0 border-2 border-black rounded-sm overflow-hidden bg-gray-100">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                            No Image
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg uppercase truncate mb-1">
                        {item.product.title}
                    </h3>
                    <p className="text-sm font-bold text-gray-600 mb-2">
                        by {sellerName}
                    </p>
                    <div className="inline-block px-2 py-1 bg-gray-100 border-2 border-black rounded-sm">
                        <p className="text-xs font-black uppercase">
                            {item.product.category}
                        </p>
                    </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-600 mb-1">PRICE</p>
                        <p className="text-xl font-black text-cyan-600" suppressHydrationWarning>
                            IDR {item.product.price.toLocaleString()}
                        </p>
                    </div>

                    <Button
                        onClick={handleRemove}
                        disabled={isRemoving}
                        variant="outline"
                        className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-black uppercase rounded-sm shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] transition-all"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isRemoving ? 'Removing...' : 'Remove'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
