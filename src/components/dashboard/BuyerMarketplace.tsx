'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, DollarSign } from 'lucide-react'
import { MarketplaceHeader } from '@/components/dashboard/MarketplaceHeader'
import { MarketplaceGrid } from '@/components/dashboard/MarketplaceGrid'

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

interface BuyerMarketplaceProps {
    products: Product[]
    userName: string
    purchaseCount: number
    totalSpent: number
}

export function BuyerMarketplace({ products, userName, purchaseCount, totalSpent }: BuyerMarketplaceProps) {
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
        <div className="space-y-8">
            <MarketplaceHeader
                userName={userName}
                onCategoryChange={setSelectedCategory}
            />

            {/* Buyer Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2 border-neo shadow-neo rounded-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase">Total Purchases</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-cyan-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{purchaseCount}</div>
                        <p className="text-xs font-bold text-muted-foreground mt-1">Assets in your library</p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-neo shadow-neo rounded-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-cyan-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black" suppressHydrationWarning>IDR {totalSpent.toLocaleString()}</div>
                        <p className="text-xs font-bold text-muted-foreground mt-1">All-time spending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Marketplace Products */}
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Browse Assets</h2>
                <MarketplaceGrid products={filteredProducts} />
            </div>
        </div>
    )
}
