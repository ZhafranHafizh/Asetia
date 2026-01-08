'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadSelfie(formData: FormData) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error('Auth error:', authError)
            return { error: 'Tidak terautentikasi. Silakan login kembali.' }
        }

        const file = formData.get('selfie') as File
        if (!file) {
            return { error: 'Tidak ada file yang dipilih' }
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { error: 'File harus berupa gambar (JPG, PNG, dll)' }
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return { error: 'Ukuran file maksimal 5MB. File Anda: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB' }
        }

        // Create file path with timestamp
        const timestamp = Date.now()
        const fileExt = file.name.split('.').pop() || 'jpg'
        const filePath = `${user.id}/selfie_${timestamp}.${fileExt}`

        console.log('Uploading file:', filePath, 'Size:', file.size, 'bytes')

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('id-verifications')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)

            // Handle specific storage errors
            if (uploadError.message.includes('already exists')) {
                return { error: 'File sudah ada. Silakan coba lagi.' }
            }
            if (uploadError.message.includes('not found')) {
                return { error: 'Bucket storage tidak ditemukan. Hubungi admin.' }
            }

            return { error: 'Gagal mengupload file: ' + uploadError.message }
        }

        console.log('File uploaded successfully, updating profile...')

        // Update profile with selfie path
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ selfie_path: filePath })
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error:', updateError)

            // Try to delete the uploaded file if profile update fails
            try {
                await supabase.storage.from('id-verifications').remove([filePath])
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError)
            }

            return { error: 'Gagal menyimpan referensi file. Silakan coba lagi.' }
        }

        console.log('Profile updated successfully')
        revalidatePath('/onboarding/verification')

        return { success: true, path: filePath }
    } catch (error) {
        console.error('Unexpected error in uploadSelfie:', error)

        // Return user-friendly error message
        if (error instanceof Error) {
            return { error: 'Terjadi kesalahan: ' + error.message }
        }

        return { error: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi support.' }
    }
}
