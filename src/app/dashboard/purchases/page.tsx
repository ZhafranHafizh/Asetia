import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PurchaseItemRow } from '@/components/dashboard/PurchaseItemRow'
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

    // Fetch transactions with product and seller details
    // We now fetch transaction_items as well to support cart purchases
    const { data: transactions, count, error: fetchError } = await supabase
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

    // If transactions is null (query error), treat as empty array to avoid crashes
    if (transactions === null || fetchError) {
        return (
            <div className="space-y-8">
                {showSuccess && <SuccessNotification />}
                <div className="text-center py-20 bg-red-50 rounded-sm">
                    <h3 className="text-lg font-black text-red-500">Error loading purchases</h3>
                    <p className="text-sm text-red-700 mt-2">{fetchError?.message || 'Unknown error'}</p>
                </div>
            </div>
        )
    }

    // Flatten transactions into a list of purchasable items
    // This handles both legacy (single product) and new (cart items) flows
    const allPurchaseItems: any[] = []

    transactions.forEach((t: any) => {
        // Handle Cart Items
        if (t.transaction_items && t.transaction_items.length > 0) {
            t.transaction_items.forEach((item: any) => {
                if (item.product) {
                    allPurchaseItems.push({
                        ...t, // Inherit usage/dates from transaction
                        id: item.id, // Use Item ID for download actions to work per-item
                        is_downloaded: item.is_downloaded,
                        product: item.product,
                        itemId: item.id, // Pass item ID for cart item specific logic
                        originalTransactionId: t.id
                    })
                }
            })
        }
        // Handle Legacy Single Purchase
        else if (t.product) {
            allPurchaseItems.push({
                ...t,
                itemId: null // No specific item ID
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
    interface TransactionItem {
        id: string
        itemId?: string // specific transaction_items id
        created_at: string
        status: string
        amount: number
        is_downloaded: boolean
        product: {
            id: string
            title: string
            category: string
            download_policy: 'unlimited' | 'once' | 'timed'
            download_duration_hours?: number
            seller_id: string
        }
        seller?: {
            id: string
            store_name?: string
            full_name?: string
            store_logo?: string
        }
    }

    const groupedTransactions: Record<string, TransactionItem[]> = {}

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

    const hasPurchases = Object.keys(groupedTransactions).length > 0

    return (
        <div className="space-y-8">
            {showSuccess && <SuccessNotification />}

            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">My Purchases</h1>
                <p className="text-muted-foreground font-medium mt-2">
                    Your digital asset library
                </p>
            </div>

            {hasPurchases ? (
                <div className="space-y-10">
                    {Object.entries(groupedTransactions).map(([date, items]) => (
                        <div key={date}>
                            <h3 className="text-xl font-black uppercase mb-4 pl-1 border-l-4 border-black">
                                {date}
                            </h3>
                            <div className="space-y-4">
                                {items?.map((item: any) => (
                                    <PurchaseItemRow
                                        key={item.itemId || item.id}
                                        transaction={item}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-sm opacity-60 bg-white">
                    <h3 className="text-2xl font-black uppercase text-muted-foreground">No Purchases Yet</h3>
                    <p className="font-medium text-muted-foreground mt-2">Start exploring the marketplace!</p>
                </div>
            )}
        </div>
    )
}
