'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitSellerOnboarding(formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const storeName = formData.get('store_name') as string
    const storeBio = formData.get('store_bio') as string

    // Validate inputs
    if (!storeName || storeName.trim().length < 3) {
        return { error: 'Store name must be at least 3 characters' }
    }

    if (!storeBio || storeBio.trim().length < 10) {
        return { error: 'Store bio must be at least 10 characters' }
    }

    // Check if store name is already taken
    const { data: existingStore } = await supabase
        .from('profiles')
        .select('id')
        .eq('store_name', storeName.trim())
        .single()

    if (existingStore) {
        return { error: 'Store name is already taken' }
    }

    // Update profile with seller information
    const { error } = await supabase
        .from('profiles')
        .update({
            store_name: storeName.trim(),
            store_bio: storeBio.trim(),
            verification_status: 'pending'
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'Failed to submit onboarding. Please try again.' }
    }

    revalidatePath('/onboarding/seller')
    return { success: true }
}
