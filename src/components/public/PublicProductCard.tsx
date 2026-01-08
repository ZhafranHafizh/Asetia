import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface PublicProductCardProps {
    product: {
        id: string
        title: string
        price: number
        preview_url: string
        category?: string
        seller_id: string
    }
    sellerName?: string
}

export function PublicProductCard({ product, sellerName }: PublicProductCardProps) {
    const supabase = createClient()

    // Resolve Image URL
    const imageUrl = product.preview_url?.startsWith('http')
        ? product.preview_url
        : supabase.storage.from('assets').getPublicUrl(product.preview_url).data.publicUrl

    return (
        <Card className="border-2 border-neo shadow-neo rounded-sm overflow-hidden flex flex-col h-full hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
            <div className="relative w-full h-48 border-b-2 border-neo bg-gray-100">
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

            <CardHeader className="p-4 pb-2 space-y-1">
                <h3 className="font-black text-lg uppercase leading-tight line-clamp-2">{product.title}</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase">{product.category || 'Asset'}</p>
                {sellerName && (
                    <p className="text-xs font-bold text-gray-600">by {sellerName}</p>
                )}
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-2xl font-black" suppressHydrationWarning>IDR {product.price.toLocaleString()}</p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Link href={`/product/${product.id}`} className="w-full">
                    <Button className="w-full bg-primary text-black font-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase">
                        View Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
