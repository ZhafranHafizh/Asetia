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

