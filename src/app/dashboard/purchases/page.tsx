import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RouteGuard } from '@/components/dashboard/RouteGuard'
import { PurchasesClient } from '@/components/dashboard/PurchasesClient'
import { SuccessNotification } from '@/components/dashboard/SuccessNotification'

export default async function PurchasesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const showSuccess = searchParams?.success === 'true'

    // Single fetch - data is cached on client side
    const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select(`
            id,
            created_at,
            status,
            amount,
            is_downloaded,
            product:products(
                id,
                title,
                category,
                download_policy,
                download_duration_hours,
                seller_id
            ),
            transaction_items(
                id,
                price_at_purchase,
                is_downloaded,
                product:products(
                    id,
                    title,
                    category,
                    download_policy,
                    download_duration_hours,
                    seller_id
                )
            )
        `)
        .eq('buyer_id', user.id)
        .eq('status', 'settlement')
        .order('created_at', { ascending: false })

    if (transactions === null || fetchError) {
        return (
            <RouteGuard allowedMode="buyer" redirectTo="/dashboard/products">
                <div className="space-y-8">
                    {showSuccess && <SuccessNotification />}
                    <div className="text-center py-20 bg-red-50 rounded-sm">
                        <h3 className="text-lg font-black text-red-500">Error loading purchases</h3>
                        <p className="text-sm text-red-700 mt-2">{fetchError?.message || 'Unknown error'}</p>
                    </div>
                </div>
            </RouteGuard>
        )
    }

    // Flatten transactions into purchasable items
    const allPurchaseItems: any[] = []

    transactions.forEach((t: any) => {
        if (t.transaction_items && t.transaction_items.length > 0) {
            t.transaction_items.forEach((item: any) => {
                if (item.product) {
                    allPurchaseItems.push({
                        ...t,
                        id: item.id,
                        is_downloaded: item.is_downloaded,
                        product: item.product,
                        itemId: item.id,
                        originalTransactionId: t.id
                    })
                }
            })
        } else if (t.product) {
            allPurchaseItems.push({
                ...t,
                itemId: null
            })
        }
    })

    // Fetch Sellers
    const sellerIds = [...new Set(allPurchaseItems.map((t: any) => t.product?.seller_id).filter(Boolean))]

    const { data: sellers } = await supabase
        .from('profiles')
        .select('id, store_name, full_name, store_logo')
        .in('id', sellerIds as string[])

    const sellerMap = new Map(sellers?.map((s) => [s.id, s]))

    // Group by Date
    const groupedTransactions: Record<string, any[]> = {}

    allPurchaseItems.forEach((item: any) => {
        const date = new Date(item.created_at).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        if (!groupedTransactions[date]) {
            groupedTransactions[date] = []
        }

        const sellerId = item.product?.seller_id
        const seller = sellerId ? sellerMap.get(sellerId) : undefined

        groupedTransactions[date].push({
            ...item,
            seller
        })
    })

    return (
        <RouteGuard allowedMode="buyer" redirectTo="/dashboard/products">
            <div className="space-y-8">
                {showSuccess && <SuccessNotification />}

                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">My Purchases</h1>
                    <p className="text-muted-foreground font-medium mt-2">
                        Your digital asset library
                    </p>
                </div>

                {/* Client component handles all interactivity with cached data */}
                <PurchasesClient groupedTransactions={groupedTransactions} />
            </div>
        </RouteGuard>
    )
}
