import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { CheckoutSimulator } from '@/components/checkout/CheckoutSimulator'
import { Calendar, User, Store, CreditCard } from 'lucide-react'
import { StoreAvatar } from '@/components/shared/StoreAvatar'

export default async function CheckoutPage(props: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await props.params
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Check if this is a bulk transaction
    const isBulk = searchParams.bulk === 'true'
    const transactionIds = searchParams.ids ?
        (typeof searchParams.ids === 'string' ? searchParams.ids.split(',') : searchParams.ids) :
        [params.id]

    // Fetch transaction(s) with product details
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            *,
            product:products(*)
        `)
        .in('id', transactionIds)
        .eq('buyer_id', user.id)

    if (error || !transactions || transactions.length === 0) {
        console.error('Transaction fetch error:', error)
        redirect('/dashboard')
    }

    const mainTransaction = transactions[0]

    // If already settled, redirect to purchases
    if (mainTransaction.status === 'settlement') {
        redirect('/dashboard/purchases?success=true')
    }

    // Calculate total amount
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

    // Get unique sellers (in case of multiple sellers in cart)
    const uniqueSellerIds = [...new Set(transactions.map(t => t.product.seller_id))]

    console.log('Unique seller IDs:', uniqueSellerIds)

    // Fetch seller profiles (email is in auth.users, not profiles)
    const { data: sellers, error: sellersError } = await supabase
        .from('profiles')
        .select('id, full_name, store_name, store_logo')
        .in('id', uniqueSellerIds)

    console.log('Sellers data:', sellers)
    console.log('Sellers error:', sellersError)

    // Fetch buyer profile
    const { data: buyer } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    // Generate invoice number
    const createdDate = new Date(mainTransaction.created_at)
    const invoiceNumber = `INV/${createdDate.getFullYear()}/${String(createdDate.getMonth() + 1).padStart(2, '0')}/${mainTransaction.id.slice(0, 8).toUpperCase()}`
    const formattedDate = createdDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Invoice Card */}
                <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white">
                    <CardContent className="p-8 md:p-12">
                        {/* Header with Logo */}
                        <div className="flex items-start justify-between mb-8 pb-6 border-b-4 border-black">
                            <div>
                                <h1 className="text-5xl font-black uppercase tracking-tighter mb-2 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                    ASETIA
                                </h1>
                                <p className="text-sm font-bold text-gray-600 uppercase">Digital Asset Marketplace</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block px-4 py-2 bg-yellow-400 border-3 border-black rounded-sm mb-2">
                                    <p className="text-xs font-black uppercase text-gray-700">Status</p>
                                    <p className="text-2xl font-black uppercase">{mainTransaction.status}</p>
                                </div>
                                {isBulk && (
                                    <div className="mt-2 inline-block px-3 py-1 bg-cyan-100 border-2 border-black rounded-sm">
                                        <p className="text-xs font-black uppercase">
                                            {transactions.length} Items
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="border-2 border-black p-4 rounded-sm bg-gray-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="h-5 w-5" />
                                    <p className="font-black uppercase text-sm">Invoice Details</p>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs font-bold text-gray-600">Invoice Number</p>
                                        <p className="font-black text-lg">{invoiceNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-600">Transaction Date</p>
                                        <p className="font-bold">{formattedDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-2 border-black p-4 rounded-sm bg-gray-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <CreditCard className="h-5 w-5" />
                                    <p className="font-black uppercase text-sm">Payment Method</p>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs font-bold text-gray-600">Method</p>
                                        <p className="font-black">Simulated Payment</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-600">Transaction ID</p>
                                        <p className="font-mono text-sm font-bold">{mainTransaction.id.slice(0, 16)}...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Information */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="border-2 border-black p-4 rounded-sm bg-cyan-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="h-5 w-5" />
                                    <p className="font-black uppercase text-sm">Bill To</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-lg">{buyer?.full_name || user.email?.split('@')[0] || 'Buyer'}</p>
                                    <p className="font-medium text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>

                            <div className="border-2 border-black p-4 rounded-sm bg-green-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Store className="h-5 w-5" />
                                    <p className="font-black uppercase text-sm">Seller{uniqueSellerIds.length > 1 ? 's' : ''} Info</p>
                                </div>
                                <div className="space-y-2">
                                    {sellers && sellers.length > 0 ? (
                                        sellers.map((seller) => (
                                            <div key={seller.id} className="flex items-center gap-3">
                                                <StoreAvatar
                                                    storeName={seller.store_name || seller.full_name || 'Seller'}
                                                    logoUrl={seller.store_logo ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${seller.store_logo}` : null}
                                                    size="sm"
                                                />
                                                <div className="space-y-0">
                                                    <p className="font-black text-sm">{seller.store_name || seller.full_name || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm font-bold text-gray-600">
                                            <p>Seller information unavailable</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Itemized Table */}
                        <div className="mb-8">
                            <h2 className="font-black uppercase text-xl mb-4">Order Items</h2>
                            <div className="border-4 border-black rounded-sm overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 bg-black text-white font-black uppercase text-sm">
                                    <div className="col-span-6 p-4 border-r-2 border-white">Product Name</div>
                                    <div className="col-span-3 p-4 border-r-2 border-white">Category</div>
                                    <div className="col-span-3 p-4 text-right">Price</div>
                                </div>
                                {/* Table Body */}
                                {transactions.map((transaction, index) => (
                                    <div key={transaction.id} className={`grid grid-cols-12 bg-white ${index < transactions.length - 1 ? 'border-b-2 border-gray-200' : ''}`}>
                                        <div className="col-span-6 p-4 border-r-2 border-black">
                                            <p className="font-black text-lg">{transaction.product.title}</p>
                                        </div>
                                        <div className="col-span-3 p-4 border-r-2 border-black">
                                            <span className="inline-block px-2 py-1 bg-gray-200 border-2 border-black rounded-sm font-bold text-xs uppercase">
                                                {transaction.product.category || 'Digital Asset'}
                                            </span>
                                        </div>
                                        <div className="col-span-3 p-4 text-right">
                                            <div className="font-black text-xl" suppressHydrationWarning>
                                                IDR {Number(transaction.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Total Row */}
                                <div className="grid grid-cols-12 bg-cyan-500 border-t-4 border-black">
                                    <div className="col-span-9 p-4 font-black uppercase text-white text-lg">
                                        Total Amount {isBulk && `(${transactions.length} items)`}
                                    </div>
                                    <div className="col-span-3 p-4 text-right">
                                        <div className="font-black text-2xl text-white" suppressHydrationWarning>
                                            IDR {totalAmount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Action */}
                        <CheckoutSimulator
                            transactionId={mainTransaction.id}
                            transactionIds={isBulk ? transactionIds : undefined}
                            isBulk={isBulk}
                        />

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase">
                                This is a computer-generated invoice • No signature required
                            </p>
                            <p className="text-xs font-medium text-gray-400 mt-1">
                                Powered by ASETIA Digital Marketplace
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
