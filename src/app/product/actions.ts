'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSecureDownloadUrl(productId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // specific check: verify user owns this product via settlement transaction
    const { data: transaction } = await supabase
        .from('transactions')
        .select('status, id')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .eq('status', 'settlement')
        .maybeSingle()

    if (!transaction) {
        return { error: 'You have not purchased this product.' }
    }

    // Get product file path
    const { data: product } = await supabase
        .from('products')
        .select('file_path')
        .eq('id', productId)
        .single()

    if (!product || !product.file_path) {
        return { error: 'Product file not found.' }
    }

    // Generate signed URL with short expiration (60 seconds)
    const { data: signedUrl, error: storageError } = await supabase.storage
        .from('assets')
        .createSignedUrl(product.file_path, 60)

    if (storageError || !signedUrl) {
        console.error('Storage error:', storageError)
        return { error: 'Failed to generate secure download link.' }
    }

    return { url: signedUrl.signedUrl }
}
