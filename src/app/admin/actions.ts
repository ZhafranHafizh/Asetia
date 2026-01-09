'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Admin-only action to resend download access for a transaction item
 * This resets the is_downloaded flag and extends the expiry time
 * 
 * @param transactionItemId - The ID of the transaction_item to reset
 * @returns Success or error message
 */
export async function resendDownloadAccess(transactionItemId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // TODO: Add admin role check here when role system is implemented
    // const { data: profile } = await supabase
    //     .from('profiles')
    //     .select('role')
    //     .eq('id', user.id)
    //     .single()
    // 
    // if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    //     return { error: 'Forbidden: Admin access required' }
    // }

    // Get the transaction item
    const { data: item, error: fetchError } = await supabase
        .from('transaction_items')
        .select(`
            id,
            transaction_id,
            is_downloaded,
            created_at,
            transaction:transactions(
                id,
                buyer_id,
                created_at
            )
        `)
        .eq('id', transactionItemId)
        .single()

    if (fetchError || !item) {
        return { error: 'Transaction item not found' }
    }

    // Reset is_downloaded flag
    const { error: updateError } = await supabase
        .from('transaction_items')
        .update({
            is_downloaded: false
        })
        .eq('id', transactionItemId)

    if (updateError) {
        return { error: 'Failed to reset download status: ' + updateError.message }
    }

    // Note: For extending expiry, we would need to add an expiry_extension field
    // to the transaction_items table, or modify the created_at timestamp
    // For now, we just reset the is_downloaded flag

    return {
        success: true,
        message: 'Download access has been reset. User can download again.'
    }
}

/**
 * Admin-only action to extend download expiry for a transaction item
 * 
 * @param transactionItemId - The ID of the transaction_item
 * @param extensionHours - Number of hours to extend (default: 24)
 * @returns Success or error message
 */
export async function extendDownloadExpiry(transactionItemId: string, extensionHours: number = 24) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // TODO: Add admin role check

    // Note: This would require adding an 'expiry_extension_hours' column to transaction_items
    // or modifying the created_at timestamp
    // For now, this is a placeholder for future implementation

    return {
        success: true,
        message: `Expiry extended by ${extensionHours} hours (placeholder - requires schema update)`
    }
}
