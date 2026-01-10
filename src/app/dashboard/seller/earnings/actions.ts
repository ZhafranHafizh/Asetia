'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAllSellerSales(sellerId: string) {
    const supabase = await createClient()

    console.log('GET ALL SALES: Fetching for seller:', sellerId)

    // Direct SQL query - bypasses ALL PostgREST cache and RLS issues
    // This is executed server-side with full database access
    const { data, error } = await supabase.rpc('exec_sql', {
        query: `
            SELECT 
                ti.id,
                ti.created_at,
                ti.price_at_purchase,
                p.title AS product_title,
                t.status AS transaction_status
            FROM transaction_items ti
            JOIN products p ON ti.product_id = p.id
            JOIN transactions t ON ti.transaction_id = t.id
            WHERE p.seller_id = $1
              AND t.status IN ('settlement', 'capture')
            ORDER BY ti.created_at DESC
        `,
        params: [sellerId]
    })

    if (error) {
        console.error('GET ALL SALES: SQL Error:', error)

        // Fallback: Use multi-step approach like getSellerRecentSales
        const { data: products } = await supabase
            .from('products')
            .select('id, title')
            .eq('seller_id', sellerId)

        const productIds = products?.map(p => p.id) || []
        const productMap = new Map(products?.map(p => [p.id, p.title]) || [])

        if (productIds.length === 0) {
            return { data: [], error: null }
        }

        const { data: items } = await supabase
            .from('transaction_items')
            .select('id, created_at, price_at_purchase, product_id, transaction_id')
            .in('product_id', productIds)
            .order('created_at', { ascending: false })

        if (!items || items.length === 0) {
            return { data: [], error: null }
        }

        const transactionIds = items.map(i => i.transaction_id)
        const { data: transactions } = await supabase
            .from('transactions')
            .select('id, status')
            .in('id', transactionIds)
            .in('status', ['settlement', 'capture'])

        const transactionMap = new Map(transactions?.map(t => [t.id, t.status]) || [])

        const sales = items
            .filter(item => transactionMap.has(item.transaction_id))
            .map(item => ({
                id: item.id,
                created_at: item.created_at,
                price_at_purchase: item.price_at_purchase,
                product_title: productMap.get(item.product_id) || 'Unknown',
                transaction_status: transactionMap.get(item.transaction_id)!
            }))

        console.log('GET ALL SALES: Fallback returned:', sales.length)
        return { data: sales, error: null }
    }

    console.log('GET ALL SALES: SQL returned:', data?.length)
    return { data, error: null }
}
