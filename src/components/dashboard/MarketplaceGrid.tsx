'use client'

import { useState, useMemo } from 'react'
import { MarketplaceProductCard } from './MarketplaceProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

const CATEGORIES = [
    'All',
    'UI Kit',
    'Source Code',
    'Canva Template',
    'E-Book',
    'Icon Pack',
    'Font',
    'Mockup',
    'Other'
]

interface Product {
    id: string
    title: string
    price: number
    preview_url: string
    category?: string
    profiles?: {
        full_name: string
        store_name?: string
    }
}

interface MarketplaceGridProps {
    products: Product[]
}

export function MarketplaceGrid({ products }: MarketplaceGridProps) {
    // Note: Search and filtering are now handled server-side in the parent page (sticky header)

    return (
        <div className="space-y-6">
            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <MarketplaceProductCard
                            key={product.id}
                            product={product}
                            sellerName={product.profiles?.store_name || product.profiles?.full_name || 'Unknown Seller'}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-neo rounded-sm opacity-60 bg-white">
                    <h3 className="text-2xl font-black uppercase text-muted-foreground">No Products Found</h3>
                    <p className="font-medium text-muted-foreground mt-2">
                        Try adjusting your filters in the header.
                    </p>
                </div>
            )}
        </div>
    )
}
