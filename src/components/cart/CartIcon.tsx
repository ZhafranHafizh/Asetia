import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getCartCount } from '@/app/cart/actions'

export async function CartIcon() {
    const { count } = await getCartCount()

    return (
        <Link
            href="/cart"
            className="relative group"
            aria-label={`Shopping cart with ${count} items`}
        >
            <div className="relative p-2 border-2 border-black rounded-sm bg-white hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <ShoppingCart className="h-5 w-5 text-black" />

                {count > 0 && (
                    <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-50 duration-200">
                        {count > 9 ? '9+' : count}
                    </div>
                )}
            </div>
        </Link>
    )
}
