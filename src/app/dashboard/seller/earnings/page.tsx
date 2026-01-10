import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RouteGuard } from '@/components/dashboard/RouteGuard'
import { EarningsClient } from '@/components/dashboard/earnings/EarningsClient'

export default async function EarningsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: rawTransactions, error } = await supabase
        .from('transaction_items')
        .select(`
            id,
            created_at,
            price_at_purchase,
            product:products!inner(
                title,
                seller_id
            ),
            transaction:transactions(
                status
            )
        `)
        .eq('product.seller_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching earnings:', error)
    }

    // Fetch Stats from View (Robust)
    const { data: stats } = await supabase
        .from('seller_stats')
        .select('*')
        .eq('seller_id', user.id)
        .single()

    const summaryStats = {
        totalRevenue: stats ? (Number(stats.total_earnings) || 0) : 0,
        totalSold: stats ? (Number(stats.total_sales) || 0) : 0,
        activeProducts: stats ? (Number(stats.active_products) || 0) : 0
    }

    const transactions = (rawTransactions || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        price_at_purchase: item.price_at_purchase,
        product: {
            title: item.product?.title || 'Unknown Asset'
        },
        status: item.transaction?.status || 'pending'
    }))

    return (
        <RouteGuard allowedMode="seller" redirectTo="/dashboard">
            <EarningsClient transactions={transactions} initialStats={summaryStats} />
        </RouteGuard>
    )
}
