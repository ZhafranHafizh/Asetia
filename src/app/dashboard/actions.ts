'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSellerRecentSales(sellerId: string) {
    const supabase = await createClient()



    // Try simpler approach - get products first, then transaction_items
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', sellerId)

    if (prodError) {
        console.error('SERVER ACTION: Products error:', prodError)
        return { data: null, error: prodError.message }
    }

    const productIds = products?.map(p => p.id) || []


    if (productIds.length === 0) {
        return { data: [], error: null }
    }

    // Get transaction items for these products
    const { data: items, error: itemsError } = await supabase
        .from('transaction_items')
        .select(`
            id,
            created_at,
            price_at_purchase,
            product_id,
            transaction_id
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false })
        .limit(10)



    if (itemsError) {
        console.error('SERVER ACTION: Items error:', itemsError)
        return { data: null, error: itemsError.message }
    }

    if (!items || items.length === 0) {
        return { data: [], error: null }
    }

    // Get transaction details
    const transactionIds = items.map(i => i.transaction_id)
    const { data: transactions } = await supabase
        .from('transactions')
        .select('id, created_at, status, buyer_id')
        .in('id', transactionIds)
        .in('status', ['settlement', 'capture'])

    const transactionMap = new Map(transactions?.map(t => [t.id, t]) || [])

    // Get product details
    const { data: productDetails } = await supabase
        .from('products')
        .select('id, title')
        .in('id', productIds)

    const productMap = new Map(productDetails?.map(p => [p.id, p.title]) || [])

    // Get buyer profiles
    const buyerIds = transactions?.map(t => t.buyer_id).filter(Boolean) || []
    const { data: buyers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', buyerIds)

    const buyerMap = new Map(buyers?.map(b => [b.id, b.full_name]) || [])

    // Transform to expected format
    const sales = items
        .filter(item => transactionMap.has(item.transaction_id))
        .map((item: any) => {
            const transaction = transactionMap.get(item.transaction_id)!
            return {
                id: item.id,
                transaction: {
                    id: transaction.id,
                    created_at: transaction.created_at,
                    buyer: { full_name: buyerMap.get(transaction.buyer_id) || 'Anonymous' },
                    status: transaction.status
                },
                product: { title: productMap.get(item.product_id) || 'Unknown' },
                price_at_purchase: item.price_at_purchase,
                created_at: item.created_at
            }
        })


    return { data: sales, error: null }
}
