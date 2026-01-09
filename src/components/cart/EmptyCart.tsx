import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="border-4 border-black rounded-sm p-8 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-6 bg-white border-4 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <ShoppingCart className="h-16 w-16 text-gray-400" />
                    </div>
                </div>

                <h2 className="text-3xl font-black uppercase mb-3">
                    Keranjang Kosong
                </h2>

                <p className="text-gray-600 font-bold mb-8">
                    Belum ada produk di keranjang Anda. Yuk, mulai belanja aset digital favoritmu!
                </p>

                <Link href="/dashboard">
                    <Button className="w-full bg-cyan-500 text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-14 text-lg uppercase">
                        Browse Products
                    </Button>
                </Link>
            </div>
        </div>
    )
}
