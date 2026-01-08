'use client'

import { useState, useMemo } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { PublicProductCard } from './PublicProductCard'

interface Product {
    id: string
    title: string
    price: number
    preview_url: string
    category?: string
    seller_id: string
}

interface ProductGridProps {
    products: Product[]
    sellers: Record<string, string>
}

export function ProductGrid({ products, sellers }: ProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState('All')

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'All') return products
        return products.filter(p => p.category === selectedCategory)
    }, [products, selectedCategory])

    return (
        <>
            <CategoryFilter onCategoryChange={setSelectedCategory} />

            <section id="products" className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-center">
                        Discover Assets
                    </h2>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <PublicProductCard
                                    key={product.id}
                                    product={product}
                                    sellerName={sellers[product.seller_id]}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-neo rounded-sm opacity-60 bg-white">
                            <h3 className="text-2xl font-black uppercase text-muted-foreground">No Products Found</h3>
                            <p className="font-medium text-muted-foreground mt-2">Try selecting a different category</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
