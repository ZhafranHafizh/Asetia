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
    const phoneNumber = formData.get('phone_number') as string
    const homeAddress = formData.get('home_address') as string

    // Validate inputs
    if (!storeName || storeName.trim().length < 3) {
        return { error: 'Store name must be at least 3 characters' }
    }

    if (!storeBio || storeBio.trim().length < 10) {
        return { error: 'Store bio must be at least 10 characters' }
    }

    if (!phoneNumber || phoneNumber.trim().length < 9) {
        return { error: 'Phone number must be at least 9 digits' }
    }

    if (!homeAddress || homeAddress.trim().length < 20) {
        return { error: 'Home address must be at least 20 characters' }
    }

    // Validate phone number format (numbers only)
    if (!/^\d+$/.test(phoneNumber.trim())) {
        return { error: 'Phone number must contain only numbers' }
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
            phone_number: '+62' + phoneNumber.trim(),
            home_address: homeAddress.trim(),
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
