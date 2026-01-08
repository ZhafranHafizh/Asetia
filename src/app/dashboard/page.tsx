import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingBag, DollarSign, Package } from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from '@/components/dashboard/ProductCard'
import { MarketplaceGrid } from '@/components/dashboard/MarketplaceGrid'

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

    // Fetch data based on mode
    let recentProducts = null
    let activeProductsCount = 0
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

        activeProductsCount = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', user.id)
            .then(res => res.count || 0)
    } else {
        // Buyer data - fetch all marketplace products
        const { data: products } = await supabase
            .from('products')
            .select(`
                *,
                profiles!products_seller_id_fkey(full_name)
            `)
            .order('created_at', { ascending: false })
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">
                        {mode === 'seller' ? 'Seller Dashboard' : 'Marketplace'}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2">
                        Welcome back, <span className="text-black font-bold">{profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>.
                    </p>
                </div>

                {mode === 'seller' && (
                    <Link href="/dashboard/products/new?mode=seller">
                        <Button className="bg-primary text-black font-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 px-6">
                            <Plus className="mr-2 h-5 w-5" /> ADD NEW ASSET
                        </Button>
                    </Link>
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
                                <div className="text-2xl font-black" suppressHydrationWarning>IDR {profile?.balance?.toLocaleString() || '0'}</div>
                                <p className="text-xs font-bold text-muted-foreground mt-1">+20.1% from last month</p>
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
                                <div className="text-2xl font-black">234</div>
                                <p className="text-xs font-bold text-muted-foreground mt-1">+19% from last month</p>
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
