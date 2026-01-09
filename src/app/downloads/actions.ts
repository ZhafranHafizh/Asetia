'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface DownloadEligibility {
    canDownload: boolean
    reason?: string
    expiresAt?: Date
    downloadCount?: number
}

// Helper to fetch purchase context from either transaction_items (Cart) or transactions (Legacy)
async function fetchPurchaseContext(id: string, userId: string) {
    const supabase = await createClient()

    // 1. Try transaction_items (Cart Flow)
    const { data: item, error: itemError } = await supabase
        .from('transaction_items')
        .select(`
            *,
            product:products(*),
            transaction:transactions(*)
        `)
        .eq('id', id)
        .single()

    if (item && item.transaction && item.transaction.buyer_id === userId) {
        return {
            type: 'item',
            data: item,
            product: item.product,
            status: item.transaction.status, // Payment status from parent transaction
            updated_at: item.created_at, // Use creation time of item or transaction
            is_downloaded: item.is_downloaded
        }
    }

    // 2. Try transactions (Legacy Flow)
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select(`
            *,
            product:products(*)
        `)
        .eq('id', id)
        .eq('buyer_id', userId)
        .single()

    if (transaction) {
        return {
            type: 'transaction',
            data: transaction,
            product: transaction.product,
            status: transaction.status,
            updated_at: transaction.updated_at,
            is_downloaded: transaction.is_downloaded
        }
    }

    return null
}

export async function checkDownloadEligibility(id: string): Promise<DownloadEligibility> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { canDownload: false, reason: 'Not authenticated' }
    }

    const context = await fetchPurchaseContext(id, user.id)

    if (!context) {
        return { canDownload: false, reason: 'Purchase not found' }
    }

    // Verify payment settled
    if (context.status !== 'settlement') {
        return { canDownload: false, reason: 'Payment not completed' }
    }

    const product = context.product
    if (!product) {
        return { canDownload: false, reason: 'Product unavailable' }
    }

    const policy = product.download_policy

    // Unlimited
    if (policy === 'unlimited') {
        return { canDownload: true }
    }

    // Once
    if (policy === 'once') {
        if (context.is_downloaded) {
            return {
                canDownload: false,
                reason: 'Sudah diunduh',
            }
        }
        return { canDownload: true }
    }

    // Timed
    if (policy === 'timed') {
        const purchasedAt = new Date(context.updated_at)
        const duration = product.download_duration_hours

        if (!duration) {
            return { canDownload: false, reason: 'Invalid download duration' }
        }

        const expiresAt = new Date(purchasedAt.getTime() + duration * 60 * 60 * 1000)
        const now = new Date()

        if (now > expiresAt) {
            return {
                canDownload: false,
                reason: 'Akses Berakhir',
                expiresAt
            }
        }

        return { canDownload: true, expiresAt }
    }

    return { canDownload: false, reason: 'Unknown download policy' }
}

export async function generateDownloadUrl(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check eligibility logic reuse?
    // We should re-verify here or trust checkDownloadEligibility if called right before.
    // But secure way is to re-check or rely on context fetching which checks auth.

    const context = await fetchPurchaseContext(id, user.id)
    if (!context) return { error: 'Purchase not found' }

    if (context.status !== 'settlement') return { error: 'Payment not settled' }

    // Check Once Policy (Server-side enforcement)
    // We already do this in checkEligibility, but let's double check for safety
    if (context.product.download_policy === 'once' && context.is_downloaded) {
        return { error: 'Already downloaded' }
    }

    // Generate URL
    // Use file_path as per schema
    const filePath = context.product.file_path || context.product.asset_url; // Fallback if schema differs
    if (!filePath) return { error: 'File path missing' }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('assets')
        .createSignedUrl(filePath, 3600)

    if (signedUrlError || !signedUrlData) {
        await logDownload(id, context.product.id, false)
        return { error: 'Failed to generate download link' }
    }

    await logDownload(id, context.product.id, true)

    // Mark as downloaded if 'once'
    if (context.product.download_policy === 'once') {
        if (context.type === 'item') {
            await supabase
                .from('transaction_items')
                .update({ is_downloaded: true })
                .eq('id', id)
        } else {
            await supabase
                .from('transactions')
                .update({ is_downloaded: true })
                .eq('id', id)
        }
    }

    return {
        url: signedUrlData.signedUrl,
        filename: context.product.title,
        // expiresAt could be calc if timed
    }
}

async function logDownload(transactionOrItemId: string, productId: string, success: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // We store 'transaction_id' in logs.
    // If we have an item ID, we should resolve the actual transaction ID?
    // Or we store item ID in transaction_id?
    // download_logs references public.transactions(id). It expects a Transaction ID.
    // If we pass an Item ID, it will Foreign Key fail if we act blindly.

    // We need to resolve Transaction ID if it is an Item.
    let transactionId = transactionOrItemId

    // Quick check if it's an item to resolve parent
    // (Optimization: fetchPurchaseContext earlier already gave us this, but logDownload is standalone helper usually)
    // We can just query transaction_items to see if this ID exists there.
    const { data: item } = await supabase.from('transaction_items').select('transaction_id').eq('id', transactionOrItemId).single()
    if (item) {
        transactionId = item.transaction_id
    }

    await supabase
        .from('download_logs')
        .insert({
            transaction_id: transactionId, // Must be valid UUID of transaction
            product_id: productId,
            user_id: user.id,
            ip_address: ip,
            user_agent: userAgent,
            success
        })
}

export async function getDownloadHistory(transactionId: string) {
    // This expects Transaction ID usually.
    // If passed Item ID, we might want to resolve it.
    // For now assuming transactionId.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: logs, error } = await supabase
        .from('download_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false })

    if (error) return { error: 'Failed to fetch download history' }

    return { logs }
}
