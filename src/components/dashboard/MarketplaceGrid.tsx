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
    }
}

interface MarketplaceGridProps {
    products: Product[]
}

export function MarketplaceGrid({ products }: MarketplaceGridProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    const filteredProducts = useMemo(() => {
        let filtered = products

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory)
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query) ||
                p.profiles?.full_name?.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [products, selectedCategory, searchQuery])

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search products, categories, or sellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-black rounded-sm font-bold h-12 focus:ring-cyan-500"
                />
            </div>

            {/* Category Filter */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((category) => (
                    <Button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        className={`
                            font-bold border-2 border-black rounded-sm uppercase whitespace-nowrap
                            ${selectedCategory === category
                                ? 'bg-cyan-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                : 'bg-white text-black hover:bg-gray-100'
                            }
                            transition-all
                        `}
                    >
                        {category}
                    </Button>
                ))}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <MarketplaceProductCard
                            key={product.id}
                            product={product}
                            sellerName={product.profiles?.full_name || 'Unknown Seller'}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-neo rounded-sm opacity-60 bg-white">
                    <h3 className="text-2xl font-black uppercase text-muted-foreground">No Products Found</h3>
                    <p className="font-medium text-muted-foreground mt-2">
                        {searchQuery ? 'Try a different search term' : 'Try selecting a different category'}
                    </p>
                </div>
            )}
        </div>
    )
}
