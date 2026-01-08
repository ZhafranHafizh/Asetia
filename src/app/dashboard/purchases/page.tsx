import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PurchasedProductCard } from '@/components/dashboard/PurchasedProductCard'
import { PurchaseHistoryTable } from '@/components/dashboard/PurchaseHistoryTable'
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

    // Fetch user's transactions with product details
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            *,
            product:products(*)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

    // Filter settled transactions for library
    const settledPurchases = transactions?.filter(t => t.status === 'settlement') || []

    const showSuccess = searchParams.success === 'true'

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
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">My Library</h2>
                {settledPurchases.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {settledPurchases.map((transaction: any) => (
                            <PurchasedProductCard
                                key={transaction.id}
                                product={transaction.product}
                                transactionStatus={transaction.status}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-neo rounded-sm opacity-60 bg-white">
                        <h3 className="text-2xl font-black uppercase text-muted-foreground">No Purchases Yet</h3>
                        <p className="font-medium text-muted-foreground mt-2">Start exploring the marketplace!</p>
                    </div>
                )}
            </div>

            {/* Purchase History */}
            <PurchaseHistoryTable transactions={transactions || []} />
        </div>
    )
}
