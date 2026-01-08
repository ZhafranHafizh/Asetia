import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingCart, Download, User, Star, Package, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ProductPurchaseButton } from '@/components/product/ProductPurchaseButton'
import { SecureDownloadButton } from '@/components/product/SecureDownloadButton'

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    console.log('Product Page - Params:', params)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    console.log('Product Page - User:', user?.id)

    // Fetch product with seller details
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            seller:profiles!products_seller_id_fkey(full_name)
        `)
        .eq('id', params.id)
        .single()

    console.log('Product Page - Fetch Result:', { product, error })

    console.log('Product Page - Fetch Result:', { product, error })

    if (error || !product) {
        console.error('Product Page - Error or Not Found:', error)
        notFound()
    }

    // Check if current user has purchased this product
    let hasPurchased = false
    let downloadUrl = ''

    if (user) {
        const { data: transaction } = await supabase
            .from('transactions')
            .select('status, id')
            .eq('product_id', product.id)
            .eq('buyer_id', user.id)
            .eq('status', 'settlement')
            .single()

        hasPurchased = !!transaction

        if (hasPurchased) {
            const { data: signedUrl } = await supabase.storage
                .from('assets')
                .createSignedUrl(product.file_path, 3600)
            downloadUrl = signedUrl?.signedUrl || ''
        }
    }

    const imageUrl = product.preview_url?.startsWith('http')
        ? product.preview_url
        : supabase.storage.from('assets').getPublicUrl(product.preview_url).data.publicUrl

    const isExclusive = product.sale_type === 'one_time'
    const isSold = isExclusive && product.sold_to
    const isOwnPurchase = user && product.sold_to === user.id

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Back Button */}
                <Link href="/dashboard">
                    <Button variant="outline" className="mb-6 border-2 border-black rounded-sm font-bold uppercase hover:bg-gray-100">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Marketplace
                    </Button>
                </Link>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Image */}
                    <div>
                        <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-sm overflow-hidden bg-white sticky top-8">
                            <div
                                className="relative aspect-square bg-gray-100 select-none"
                            >
                                {imageUrl ? (
                                    <>
                                        <div className="relative w-full h-full pointer-events-none select-none">
                                            <Image
                                                src={imageUrl}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                                draggable={false}
                                            />
                                        </div>
                                        {/* Transparent Overlay to block direct inspection/save */}
                                        <div className="absolute inset-0 z-10 bg-transparent" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="font-black uppercase text-gray-400">No Preview</p>
                                    </div>
                                )}

                                {/* Exclusive Badge Overlay */}
                                {isExclusive && !isSold && (
                                    <div className="absolute top-4 right-4 animate-pulse">
                                        <div className="bg-yellow-400 border-4 border-black rounded-sm px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-6 w-6 fill-black" />
                                                <div>
                                                    <p className="font-black uppercase text-sm leading-none">LIMITED</p>
                                                    <p className="font-bold text-xs">ONLY 1 SLOT</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sold Badge */}
                                {isSold && (
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-gray-400 border-4 border-black rounded-sm px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <p className="font-black uppercase text-white text-lg">SOLD OUT</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Info */}
                    <div className="space-y-6">
                        {/* Title & Category */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="inline-block px-3 py-1 bg-gray-200 border-2 border-black rounded-sm font-bold text-xs uppercase">
                                    {product.category || 'Digital Asset'}
                                </span>
                                {isExclusive ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 border-2 border-black rounded-sm font-black text-xs uppercase">
                                        <Star className="h-3 w-3" />
                                        EXCLUSIVE
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-400 border-2 border-black rounded-sm font-black text-xs uppercase">
                                        <Package className="h-3 w-3" />
                                        UNLIMITED
                                    </span>
                                )}
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter leading-tight mb-4">
                                {product.title}
                            </h1>
                        </div>

                        {/* Price Badge */}
                        <div className="inline-block bg-cyan-500 border-4 border-black rounded-sm px-6 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-xs font-bold text-white uppercase mb-1">Price</p>
                            <div className="text-4xl font-black text-white" suppressHydrationWarning>
                                IDR {product.price.toLocaleString()}
                            </div>
                        </div>

                        {/* Seller Info */}
                        <Card className="border-2 border-black rounded-sm p-4 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-black rounded-sm flex items-center justify-center">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-600 uppercase">Sold By</p>
                                    <p className="font-black text-lg">{product.seller?.full_name || 'Seller'}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Purchase Status / Actions */}
                        {hasPurchased ? (
                            <div className="space-y-4">
                                <div className="bg-green-100 border-2 border-green-600 rounded-sm p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <p className="font-black uppercase text-green-900">You Own This Product</p>
                                    </div>
                                    <p className="text-sm font-medium text-green-800">
                                        You have successfully purchased this asset. Download it below.
                                    </p>
                                </div>

                                <SecureDownloadButton productId={product.id} />
                            </div>
                        ) : isSold && !isOwnPurchase ? (
                            <div className="bg-gray-100 border-2 border-gray-400 rounded-sm p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-gray-600" />
                                    <p className="font-black uppercase text-gray-900">Sold Out</p>
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    This exclusive product has been purchased by another buyer.
                                </p>
                            </div>
                        ) : (
                            <ProductPurchaseButton
                                productId={product.id}
                                productPrice={product.price}
                                productTitle={product.title}
                                sellerName={product.seller?.full_name || 'Seller'}
                                isExclusive={isExclusive}
                                isAuthenticated={!!user}
                            />
                        )}

                        {/* Description */}
                        <Card className="border-2 border-black rounded-sm p-6 bg-white">
                            <h2 className="text-2xl font-black uppercase mb-4">Description</h2>
                            <p className="font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {product.description || 'No description provided.'}
                            </p>
                        </Card>

                        {/* What's Inside */}
                        <Card className="border-2 border-black rounded-sm p-6 bg-white">
                            <h2 className="text-2xl font-black uppercase mb-4">What's Inside</h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="font-bold text-gray-800">High-quality digital files</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="font-bold text-gray-800">Instant download after purchase</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="font-bold text-gray-800">Lifetime access to files</span>
                                </li>
                                {isExclusive && (
                                    <li className="flex items-start gap-3">
                                        <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5 fill-yellow-500" />
                                        <span className="font-bold text-gray-800">Exclusive one-time purchase - you'll be the only owner</span>
                                    </li>
                                )}
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
