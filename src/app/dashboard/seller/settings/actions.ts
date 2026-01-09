'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSellerProfile(formData: FormData) {
    const supabase = await createClient()

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

    // Check if store name is already taken by another user
    const { data: existingStore } = await supabase
        .from('profiles')
        .select('id')
        .eq('store_name', storeName.trim())
        .neq('id', user.id)
        .single()

    if (existingStore) {
        return { error: 'Store name is already taken by another seller' }
    }

    // Update profile
    const { error } = await supabase
        .from('profiles')
        .update({
            store_name: storeName.trim(),
            store_bio: storeBio.trim(),
            phone_number: phoneNumber.startsWith('+62') ? phoneNumber.trim() : '+62' + phoneNumber.trim(),
            home_address: homeAddress.trim(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'Failed to update profile. Please try again.' }
    }

    revalidatePath('/dashboard/seller/settings')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function uploadStoreLogo(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const file = formData.get('logo') as File
    if (!file) {
        return { error: 'No file provided' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        return { error: 'File must be an image' }
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
        return { error: 'File size must be less than 2MB' }
    }

    // Create file path
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const filePath = `logos/${user.id}/logo_${timestamp}.${fileExt}`

    try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return { error: 'Failed to upload logo. Please try again.' }
        }

        // Update profile with logo path
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ store_logo: filePath })
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error:', updateError)
            // Try to delete the uploaded file if profile update fails
            await supabase.storage.from('assets').remove([filePath])
            return { error: 'Failed to save logo reference. Please try again.' }
        }

        revalidatePath('/dashboard/seller/settings')
        revalidatePath('/dashboard')
        return { success: true, path: filePath }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
