import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCartItems } from './actions'
import { CartItemCard } from '@/components/cart/CartItemCard'
import { EmptyCart } from '@/components/cart/EmptyCart'
import { CheckoutButton } from '@/components/cart/CheckoutButton'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CartPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { items, error } = await getCartItems()

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-4 border-red-600 p-6 rounded-sm">
                    <p className="font-black text-red-900 uppercase">Error loading cart</p>
                    <p className="font-bold text-red-800 mt-2">{error}</p>
                </div>
            </div>
        )
    }

    const totalPrice = items.reduce((sum, item) => {
        const product = item.product as any
        return sum + Number(product?.price || 0)
    }, 0)

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b-4 border-black bg-white sticky top-0 z-40">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/dashboard"
                            className="p-2 border-2 border-black rounded-sm bg-white hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">
                                Keranjang Belanja
                            </h1>
                            <p className="text-gray-600 font-bold mt-1">
                                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <CartItemCard key={item.id} item={item as any} />
                            ))}
                        </div>

                        {/* Order Summary - Sticky */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="border-4 border-black rounded-sm bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-black pb-3">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-600">Items ({items.length})</span>
                                            <span className="font-black" suppressHydrationWarning>
                                                IDR {totalPrice.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="border-t-2 border-dashed border-gray-300 pt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-black uppercase">Total</span>
                                                <span className="text-2xl font-black text-cyan-600" suppressHydrationWarning>
                                                    IDR {totalPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <CheckoutButton
                                        cartItemIds={items.map(item => item.id)}
                                        totalAmount={totalPrice}
                                        itemCount={items.length}
                                    />

                                    <p className="text-xs text-gray-500 font-medium text-center mt-4">
                                        By proceeding, you agree to our terms and conditions
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
