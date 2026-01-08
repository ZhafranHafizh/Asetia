'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Star, Package } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
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
import { deleteProduct } from "@/app/dashboard/products/actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Product {
    id: string
    title: string
    price: number
    preview_url: string
    category?: string
    sale_type?: string
    sold_to?: string
}

export function ProductCard({ product }: { product: Product }) {
    const supabase = createClient()
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteProduct(product.id)
        setIsDeleting(false)
        if (result.error) {
            alert('Failed to delete: ' + result.error)
        } else {
            router.refresh()
        }
    }

    // Resolve Image URL
    const imageUrl = product.preview_url?.startsWith('http')
        ? product.preview_url
        : supabase.storage.from('assets').getPublicUrl(product.preview_url).data.publicUrl

    const isOneTime = product.sale_type === 'one_time'
    const isSold = isOneTime && product.sold_to

    return (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-sm overflow-hidden flex flex-col h-full hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
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

            <CardHeader className="p-4 pb-2">
                <h3 className="font-black text-lg uppercase leading-tight line-clamp-2">{product.title}</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase">{product.category || 'Uncategorized'}</p>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-2xl font-black text-primary" suppressHydrationWarning>
                    IDR {product.price.toLocaleString()}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <Link href={`/dashboard/products/${product.id}/edit?mode=seller`} className="flex-1">
                    <Button variant="outline" className="w-full border-2 border-black rounded-sm font-bold uppercase hover:bg-gray-100">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="flex-1 bg-red-500 text-white border-2 border-black rounded-sm font-bold uppercase hover:bg-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-black uppercase text-2xl">Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription className="font-medium">
                                This action cannot be undone. This will permanently delete your product
                                and remove all associated files.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-2 border-black rounded-sm font-bold uppercase">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-500 text-white border-2 border-black rounded-sm font-bold uppercase hover:bg-red-600"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}
