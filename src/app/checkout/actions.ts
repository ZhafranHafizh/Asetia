'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTransaction(productId: string, amount: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check if product is available
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('sale_type, sold_to')
        .eq('id', productId)
        .single()

    if (productError || !product) {
        return { error: 'Product not found' }
    }

    // Check if one-time product is already sold
    if (product.sale_type === 'one_time' && product.sold_to) {
        return { error: 'This exclusive product has already been sold' }
    }

    // Create transaction
    console.log('DEBUG: Creating transaction for product:', productId)
    const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
            buyer_id: user.id,
            product_id: productId,
            amount: amount,
            status: 'pending'
        })
        .select()
        .single()

    if (error) {
        console.error('DEBUG: Create transaction header error:', error)
        return { error: error.message }
    }
    console.log('DEBUG: Transaction header created:', transaction.id)

    // Also create a transaction_item for consistency with the new system
    // even for single transaction
    const { error: itemError } = await supabase
        .from('transaction_items')
        .insert({
            transaction_id: transaction.id,
            product_id: productId,
            price_at_purchase: amount
        })

    if (itemError) {
        console.error('DEBUG: Failed to create transaction item for single purchase:', itemError)
        // We might want to rollback transaction here, but for now just log it
    } else {
        console.log('DEBUG: Transaction item created successfully')
    }

    return { success: true, transactionId: transaction.id }
}

export async function simulatePayment(transactionId: string) {
    console.log('DEBUG: Simulating payment for transaction:', transactionId)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get transaction with items and product details
    // We try to fetch transaction_items if available, or fallback to product_id on transaction (legacy)
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select(`
            *, 
            product:products(sale_type, id, sold_to),
            items:transaction_items(
                id,
                product:products(sale_type, id, sold_to)
            )
        `)
        .eq('id', transactionId)
        .eq('buyer_id', user.id)
        .single()

    if (fetchError || !transaction) {
        console.error('DEBUG: Transaction not found for simulation:', fetchError)
        return { error: 'Transaction not found' }
    }

    console.log('DEBUG: Transaction found with items:', transaction.items?.length)

    // Determine product to check (support both legacy direct relation and new items relation)
    // For simulatePayment (single), we assume 1 main product
    let productToProcess = transaction.product;
    if (!productToProcess && transaction.items && transaction.items.length > 0) {
        productToProcess = transaction.items[0].product;
    }

    if (!productToProcess) {
        // Fallback or error
        console.warn('No product found for transaction', transactionId);
    }

    // For one-time sales, use atomic update to prevent race conditions
    if (productToProcess && productToProcess.sale_type === 'one_time') {
        // Check if already sold (double-check before attempting update)
        if (productToProcess.sold_to) {
            return { error: 'This exclusive product has already been sold to another buyer' }
        }

        // Atomic update
        const { data: updateResult, error: updateError } = await supabase
            .from('products')
            .update({
                sold_to: user.id,
                sold_at: new Date().toISOString()
            })
            .eq('id', productToProcess.id)
            .is('sold_to', null) // Critical: only update if not already sold
            .select()

        // If no rows were updated, someone else bought it first
        if (!updateResult || updateResult.length === 0) {
            // Mark transaction as failed
            await supabase
                .from('transactions')
                .update({ status: 'failed' })
                .eq('id', transactionId)

            return { error: 'This exclusive product was just purchased by another buyer. Your transaction has been cancelled.' }
        }

        if (updateError) {
            console.error('Error marking product as sold:', updateError)
            return { error: 'Failed to complete purchase. Please try again.' }
        }
    }

    // Update transaction status to settlement
    const { error } = await supabase
        .from('transactions')
        .update({ status: 'settlement' })
        .eq('id', transactionId)
        .eq('buyer_id', user.id)

    if (error) {
        console.error('Simulate payment error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/purchases')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/seller/earnings')
    return { success: true }
}

// New function for bulk cart checkout
export async function createBulkTransaction(cartItemIds: string[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    if (!cartItemIds || cartItemIds.length === 0) {
        return { error: 'No items in cart' }
    }

    // Fetch cart items with product details
    const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
            id,
            product:products(
                id,
                price,
                sale_type,
                sold_to,
                seller_id
            )
        `)
        .in('id', cartItemIds)
        .eq('user_id', user.id)

    if (cartError || !cartItems || cartItems.length === 0) {
        return { error: 'Cart items not found' }
    }

    // Validate all products
    let totalAmount = 0
    const productIds: string[] = []

    for (const item of cartItems) {
        const product = item.product as any

        if (!product) {
            return { error: 'One or more products not found' }
        }

        // Check if one-time product is already sold
        if (product.sale_type === 'one_time' && product.sold_to) {
            return { error: `One or more exclusive products have already been sold` }
        }

        // Prevent buying own products
        if (product.seller_id === user.id) {
            return { error: 'Cannot purchase your own products' }
        }

        totalAmount += Number(product.price)
        productIds.push(product.id)
    }

    // Create transactions for each product
    // Note: In a bulk transaction model, we might want ONE transaction with MULTIPLE items.
    // The previous implementation created MULTIPLE transactions (one per product).
    // Let's stick to the existing pattern of 1 transaction per product for now if that's what was intended, 
    // OR unify it. The User's cart system seems to imply a single checkout flow.
    // However, the `simulateBulkPayment` logic I wrote expects transactionIds (plural).
    // If we create ONE header and MANY items, we should only pass ONE transactionId.

    // BUT wait, `createBulkTransaction` in previous logic was returning `transactionIds` (plural).
    // "const transactions = productIds.map(...)".
    // This creates INDIVIDUAL transactions for each product.
    // This is fine, but it means `transaction_items` is redundant if it's 1-to-1?
    // No, earlier migration 20260109125815_create_cart_system.sql created `transaction_items` table.
    // And users want "Cart" functionality.

    // Let's follow the BETTER pattern: 1 Transaction Header (for the whole cart) + Multiple Transaction Items.
    // This is much cleaner for "Total Revenue" aggregation later and payment gateway integration.

    // 1. Create ONE Transaction Header
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
            buyer_id: user.id,
            status: 'pending',
            amount: totalAmount,
            // product_id is NULL for bulk transactions
        })
        .select()
        .single()

    if (txError || !transaction) {
        console.error('Create transaction header error:', txError)
        return { error: 'Failed to create transaction' }
    }

    // 2. Create Transaction Items
    const orderItems = cartItems.map((item: any) => ({
        transaction_id: transaction.id,
        product_id: item.product.id,
        price_at_purchase: item.product.price
    }))

    const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(orderItems)

    if (itemsError) {
        console.error('Create transaction items error:', itemsError)
        // Rollback?
        await supabase.from('transactions').delete().eq('id', transaction.id)
        return { error: 'Failed to create order items' }
    }

    return {
        success: true,
        transactionId: transaction.id, // Only one ID now
        transactionIds: [transaction.id], // Keep this for compatibility if frontend expects array
        totalAmount,
        itemCount: orderItems.length
    }
}

// Simulate payment for bulk transactions
export async function simulateBulkPayment(transactionIds: string[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Fetch transactions with items
    const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select(`
            id,
            status,
            items:transaction_items(
                id,
                product:products(
                    id,
                    sale_type,
                    sold_to
                )
            )
        `)
        .in('id', transactionIds)
        .eq('buyer_id', user.id)

    if (fetchError || !transactions || transactions.length === 0) {
        console.error('Fetch error in simulateBulkPayment:', fetchError)
        return { error: 'Transactions not found' }
    }

    // Process each transaction
    for (const transaction of transactions) {
        const items = transaction.items as any[] || []
        let transactionFailed = false

        // Check and process "one_time" products inside this transaction
        for (const item of items) {
            const product = item.product

            if (product.sale_type === 'one_time') {
                if (product.sold_to) {
                    // Already sold - mark transaction as failed
                    await supabase
                        .from('transactions')
                        .update({ status: 'failed' })
                        .eq('id', transaction.id)
                    transactionFailed = true
                    break
                }

                // Mark product as sold
                const { data: updateResult, error: updateError } = await supabase
                    .from('products')
                    .update({
                        sold_to: user.id,
                        sold_at: new Date().toISOString()
                    })
                    .eq('id', product.id)
                    .is('sold_to', null)
                    .select()

                if (updateError || !updateResult || updateResult.length === 0) {
                    await supabase
                        .from('transactions')
                        .update({ status: 'failed' })
                        .eq('id', transaction.id)
                    transactionFailed = true
                    break
                }
            }
        }

        if (transactionFailed) {
            continue
        }

        // Update transaction to settlement
        const { error: updateError } = await supabase
            .from('transactions')
            .update({ status: 'settlement' })
            .eq('id', transaction.id)

        if (updateError) {
            console.error('Failed to update transaction status:', updateError)
        }
    }

    // Clear cart items for successfully purchased products
    const successfulProductIds: string[] = []

    transactions.forEach((t: any) => {
        const items = t.items as any[]
        items.forEach((i: any) => successfulProductIds.push(i.product.id))
    })

    if (successfulProductIds.length > 0) {
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .in('product_id', successfulProductIds)
    }

    revalidatePath('/dashboard/purchases')
    revalidatePath('/dashboard')
    revalidatePath('/cart')
    revalidatePath('/dashboard/seller/earnings')

    return { success: true }
}
