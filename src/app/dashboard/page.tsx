import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingBag, DollarSign, Package, Search, Settings } from 'lucide-react'
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { ProductCard } from '@/components/dashboard/ProductCard'
import { MarketplaceGrid } from '@/components/dashboard/MarketplaceGrid'
import { maskName } from '@/lib/utils/privacy'

export default async function DashboardPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    // Verify auth again (redundant with middleware but safe)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const mode = searchParams.mode === 'seller' ? 'seller' : 'buyer'

    // Redirect buyers trying to access seller dashboard to onboarding
    if (mode === 'seller' && profile?.role === 'buyer') {
        redirect('/onboarding/seller')
    }

    // Redirect sellers with pending/no verification to verification page
    if (mode === 'seller' && profile?.verification_status === 'pending') {
        redirect('/onboarding/verification')
    }

    // Fetch data based on mode
    let recentProducts = null
    let activeProductsCount = 0
    let totalEarnings = 0
    let totalSales = 0
    let recentTransactions = null
    let allMarketplaceProducts = null
    let purchaseCount = 0
    let totalSpent = 0

    if (mode === 'seller') {
        // Seller data
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3)
        recentProducts = data

        // Check Product Ownership (Debug)
        const { data: userProducts } = await supabase
            .from('products')
            .select('id, title, seller_id')
            .eq('seller_id', user.id)
            .limit(3)
        console.log('DEBUG: User has products:', userProducts?.length, 'Example:', userProducts?.[0])

        // Fetch Stats from View (Robust)
        const { data: stats } = await supabase
            .from('seller_stats')
            .select('*')
            .eq('seller_id', user.id)
            .single()

        if (stats) {
            console.log('DEBUG: Stats from View:', stats)
            totalEarnings = Number(stats.total_earnings) || 0
            totalSales = Number(stats.total_sales) || 0
            activeProductsCount = Number(stats.active_products) || 0
        } else {
            // Fallback if view returns empty (shouldn't happen for valid seller, but maybe 0 rows)
            console.log('DEBUG: No stats found in view')
        }


        // Fetch recent sales using server action (bypasses all RLS and schema cache issues)
        const { data: salesData, error: salesError } = await import('./actions').then(m => m.getSellerRecentSales(user.id))

        console.log('DEBUG: Server Action Sales Count:', salesData?.length)
        if (salesError) {
            console.error('DEBUG: Server Action Sales Error:', salesError)
        }

        const recentSales = salesData || []


        // Map flatten structure for UI
        if (recentSales) {
            recentTransactions = recentSales.map((item: any) => ({
                id: item.id,
                amount: item.price_at_purchase,
                created_at: item.created_at,
                product: item.product,
                buyer: item.transaction?.buyer
            }))
        }

    } else {
        // Buyer data - fetch all marketplace products with filters
        let query = supabase
            .from('products')
            .select(`
                *,
                profiles!products_seller_id_fkey(full_name, store_name)
            `)
            .order('created_at', { ascending: false })

        if (searchParams.category) {
            query = query.eq('category', searchParams.category)
        }

        if (searchParams.search) {
            query = query.ilike('title', `%${searchParams.search}%`)
        }

        const { data: products } = await query
        allMarketplaceProducts = products

        // Fetch buyer stats
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, status')
            .eq('buyer_id', user.id)

        if (transactions) {
            purchaseCount = transactions.filter(t => t.status === 'settlement').length
            totalSpent = transactions
                .filter(t => t.status === 'settlement')
                .reduce((sum, t) => sum + Number(t.amount), 0)
        }
    }

    return (
        <div className="space-y-8">
            {/* Sticky Header Wrapper */}
            <div className="sticky top-0 z-40 bg-white pt-6 pb-4 -mx-8 px-8 border-b-4 border-black shadow-sm mb-8">
                <div className="grid gap-4 md:grid-cols-2 md:items-end justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">
                            {mode === 'seller' ? 'Seller Dashboard' : 'Marketplace'}
                        </h1>
                        <p className="text-muted-foreground font-medium mt-2">
                            Welcome back, <span className="text-black font-bold">{profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>.
                        </p>
                    </div>

                    {mode === 'seller' ? (
                        <div className="flex justify-end">
                            <Link href="/dashboard/products/new?mode=seller">
                                <Button className="bg-primary text-black font-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 px-6">
                                    <Plus className="mr-2 h-5 w-5" /> ADD NEW ASSET
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Search Bar for Buyer */}
                            <form className="w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search assets..."
                                        className="pl-9 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 rounded-sm font-medium w-full bg-white"
                                        defaultValue={searchParams.search}
                                    />
                                    {/* Preserve mode if exists */}
                                    {searchParams.mode && <input type="hidden" name="mode" value={searchParams.mode} />}
                                    {/* Preserve category if exists */}
                                    {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {mode !== 'seller' && (
                    /* Categories for Buyer - Inside Sticky Header */
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <Link href="/dashboard">
                            <Button
                                variant={!searchParams.category ? "default" : "outline"}
                                className={`rounded-sm border-2 border-black font-black uppercase ${!searchParams.category ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(100,100,100,1)]" : "bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"}`}
                            >
                                All
                            </Button>
                        </Link>
                        {['UI Kit', 'Source Code', 'Canva Template', 'E-Book', 'Icon Pack', 'Font', 'Mockup', 'Other'].map((category) => (
                            <Link key={category} href={`/dashboard?category=${category}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                                <Button
                                    variant={searchParams.category === category ? "default" : "outline"}
                                    className={`rounded-sm border-2 border-black font-black uppercase whitespace-nowrap ${searchParams.category === category ? "bg-cyan-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"}`}
                                >
                                    {category}
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {mode === 'seller' ? (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-2 border-neo shadow-neo rounded-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold uppercase">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black" suppressHydrationWarning>IDR {totalEarnings.toLocaleString()}</div>
                                <p className="text-xs font-bold text-muted-foreground mt-1">From {totalSales} successful sales</p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-neo shadow-neo rounded-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold uppercase">Active Products</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black">{activeProductsCount}</div>
                                <p className="text-xs font-bold text-muted-foreground mt-1">Total assets listed</p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-neo shadow-neo rounded-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold uppercase">Total Sales</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black">{totalSales}</div>
                                <p className="text-xs font-bold text-muted-foreground mt-1">Settlement transactions</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Uploads Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Recent Uploads</h2>
                            <Link href="/dashboard/products?mode=seller" className="text-sm font-bold underline hover:text-primary">
                                View All
                            </Link>
                        </div>

                        {recentProducts && recentProducts.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-3">
                                {recentProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-neo rounded-sm opacity-60">
                                <p className="font-bold text-muted-foreground">No recent uploads.</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Recent Sales</h2>
                        </div>

                        {recentTransactions && recentTransactions.length > 0 ? (
                            <Card className="border-2 border-neo shadow-neo rounded-sm">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="border-b-2 border-black">
                                                <tr className="bg-gray-50">
                                                    <th className="text-left p-4 font-black uppercase text-xs">Buyer</th>
                                                    <th className="text-left p-4 font-black uppercase text-xs">Product</th>
                                                    <th className="text-left p-4 font-black uppercase text-xs">Date</th>
                                                    <th className="text-right p-4 font-black uppercase text-xs">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentTransactions.map((transaction: any) => (
                                                    <tr key={transaction.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 font-medium">{maskName(transaction.buyer?.full_name)}</td>
                                                        <td className="p-4">{transaction.product?.title || 'N/A'}</td>
                                                        <td className="p-4 text-muted-foreground">
                                                            {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="p-4 text-right font-bold">
                                                            IDR {Number(transaction.amount).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-neo rounded-sm opacity-60">
                                <p className="font-bold text-muted-foreground">No sales yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
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
                        <MarketplaceGrid products={allMarketplaceProducts || []} />
                    </div>
                </div>
            )}
        </div>
    )
}
