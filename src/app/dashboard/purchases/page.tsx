import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PurchasedProductCard } from '@/components/dashboard/PurchasedProductCard'
import { PurchaseHistoryTable } from '@/components/dashboard/PurchaseHistoryTable'
import { SuccessNotification } from '@/components/dashboard/SuccessNotification'
import { Pagination } from '@/components/ui/Pagination'

const ITEMS_PER_PAGE = 9

export default async function PurchasesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const currentPage = Number(searchParams?.page) || 1
    const showSuccess = searchParams?.success === 'true'

    // Fetch paginated settled purchases for "My Library"
    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data: libraryTransactions, count } = await supabase
        .from('transactions')
        .select(`
            *,
            product:products(*)
        `, { count: 'exact' })
        .eq('buyer_id', user.id)
        .eq('status', 'settlement')
        .order('created_at', { ascending: false })
        .range(from, to)

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0

    // Fetch recent history separately (limit 10 for quick view, or could be separate page)
    // For now, let's keep fetching all or just last 20 for history table to avoid huge loads
    const { data: historyTransactions } = await supabase
        .from('transactions')
        .select(`
            *,
            product:products(*)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    const settledPurchases = libraryTransactions || []

    return (
        <div className="space-y-8">
            {showSuccess && <SuccessNotification />}

            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">My Purchases</h1>
                <p className="text-muted-foreground font-medium mt-2">
                    Your digital asset library
                </p>
            </div>

            {/* Purchased Assets Library */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight">My Library</h2>
                    <p className="text-sm font-bold text-gray-500">
                        Showing {settledPurchases.length} of {count || 0} items
                    </p>
                </div>

                {settledPurchases.length > 0 ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {settledPurchases.map((transaction: any) => (
                                <PurchasedProductCard
                                    key={transaction.id}
                                    product={transaction.product}
                                    transactionStatus={transaction.status}
                                />
                            ))}
                        </div>

                        <Pagination totalPages={totalPages} currentPage={currentPage} />
                    </>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-neo rounded-sm opacity-60 bg-white">
                        <h3 className="text-2xl font-black uppercase text-muted-foreground">No Purchases Yet</h3>
                        <p className="font-medium text-muted-foreground mt-2">Start exploring the marketplace!</p>
                    </div>
                )}
            </div>

            {/* Purchase History */}
            <div className="mt-12">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Recent History</h2>
                <PurchaseHistoryTable transactions={historyTransactions || []} />
            </div>
        </div>
    )
}
