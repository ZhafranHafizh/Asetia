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
        console.error('Create transaction error:', error)
        return { error: error.message }
    }

    return { success: true, transactionId: transaction.id }
}

export async function simulatePayment(transactionId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get transaction with product details
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*, product:products(sale_type, id, sold_to)')
        .eq('id', transactionId)
        .eq('buyer_id', user.id)
        .single()

    if (fetchError || !transaction) {
        return { error: 'Transaction not found' }
    }

    // For one-time sales, use atomic update to prevent race conditions
    if (transaction.product.sale_type === 'one_time') {
        // Check if already sold (double-check before attempting update)
        if (transaction.product.sold_to) {
            return { error: 'This exclusive product has already been sold to another buyer' }
        }

        // Atomic update: only succeeds if sold_to is still null
        // This prevents race conditions where two buyers try to purchase simultaneously
        const { data: updateResult, error: updateError } = await supabase
            .from('products')
            .update({
                sold_to: user.id,
                sold_at: new Date().toISOString()
            })
            .eq('id', transaction.product.id)
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
    const transactions = productIds.map(productId => {
        const cartItem = cartItems.find((item: any) => item.product.id === productId)
        const product = cartItem?.product as any
        return {
            buyer_id: user.id,
            product_id: productId,
            amount: product?.price || 0,
            status: 'pending' as const
        }
    })

    const { data: createdTransactions, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactions)
        .select()

    if (transactionError || !createdTransactions || createdTransactions.length === 0) {
        console.error('Create bulk transaction error:', transactionError)
        return { error: 'Failed to create transactions' }
    }

    // Return the first transaction ID (we'll use this for the checkout page)
    // In a real Midtrans integration, you'd create a single order with multiple item_details
    return {
        success: true,
        transactionId: createdTransactions[0].id,
        transactionIds: createdTransactions.map(t => t.id),
        totalAmount,
        itemCount: createdTransactions.length
    }
}

// Simulate payment for bulk transactions
export async function simulateBulkPayment(transactionIds: string[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Fetch all transactions
    const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*, product:products(sale_type, id, sold_to)')
        .in('id', transactionIds)
        .eq('buyer_id', user.id)

    if (fetchError || !transactions || transactions.length === 0) {
        return { error: 'Transactions not found' }
    }

    // Process each transaction
    for (const transaction of transactions) {
        const product = transaction.product as any

        // For one-time sales, use atomic update
        if (product.sale_type === 'one_time') {
            if (product.sold_to) {
                // Mark this transaction as failed
                await supabase
                    .from('transactions')
                    .update({ status: 'failed' })
                    .eq('id', transaction.id)
                continue
            }

            const { data: updateResult, error: updateError } = await supabase
                .from('products')
                .update({
                    sold_to: user.id,
                    sold_at: new Date().toISOString()
                })
                .eq('id', product.id)
                .is('sold_to', null)
                .select()

            if (!updateResult || updateResult.length === 0) {
                await supabase
                    .from('transactions')
                    .update({ status: 'failed' })
                    .eq('id', transaction.id)
                continue
            }

            if (updateError) {
                console.error('Error marking product as sold:', updateError)
                await supabase
                    .from('transactions')
                    .update({ status: 'failed' })
                    .eq('id', transaction.id)
                continue
            }
        }

        // Update transaction to settlement
        await supabase
            .from('transactions')
            .update({ status: 'settlement' })
            .eq('id', transaction.id)
    }

    // Clear cart items for successfully purchased products
    const successfulProductIds = transactions
        .filter((t: any) => t.product.sale_type !== 'one_time' || !t.product.sold_to)
        .map((t: any) => t.product.id)

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

    return { success: true }
}

