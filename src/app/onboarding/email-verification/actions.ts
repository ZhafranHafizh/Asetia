'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateVerificationCode, getCodeExpiration } from '@/lib/utils/verification'

export async function sendVerificationCode() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Tidak terautentikasi' }
        }

        // Generate verification code
        const code = generateVerificationCode()
        const expiresAt = getCodeExpiration()

        // Update profile with verification code
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                verification_code: code,
                code_expires_at: expiresAt.toISOString()
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Failed to save verification code:', updateError)
            return { error: 'Gagal membuat kode verifikasi' }
        }

        // TODO: Send email with code using Resend
        // For now, just log it for development
        console.log('🔐 VERIFICATION CODE:', code)
        console.log('📧 Would send to:', user.email)
        console.log('⏰ Expires at:', expiresAt.toLocaleString('id-ID'))

        revalidatePath('/onboarding/email-verification')

        return {
            success: true,
            code, // Return code for dev mode display
            email: user.email
        }
    } catch (error) {
        console.error('Error in sendVerificationCode:', error)
        return { error: 'Terjadi kesalahan saat mengirim kode' }
    }
}

export async function verifyCodeAndActivate(code: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Tidak terautentikasi' }
        }

        // Get user profile with verification code
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('verification_code, code_expires_at')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return { error: 'Profil tidak ditemukan' }
        }

        // Check if code exists
        if (!profile.verification_code) {
            return { error: 'Kode verifikasi belum dikirim. Silakan kirim kode terlebih dahulu.' }
        }

        // Check if code matches (case-insensitive)
        if (profile.verification_code.toLowerCase() !== code.toLowerCase().trim()) {
            return { error: 'Kode verifikasi salah. Periksa kembali kode Anda.' }
        }

        // Check if code is expired
        const expiresAt = new Date(profile.code_expires_at)
        const now = new Date()
        if (now > expiresAt) {
            return { error: 'Kode verifikasi sudah kadaluarsa. Silakan kirim kode baru.' }
        }

        // Activate seller account
        const { error: activationError } = await supabase
            .from('profiles')
            .update({
                role: 'seller',
                verification_status: 'verified',
                verification_code: null, // Clear the code
                code_expires_at: null
            })
            .eq('id', user.id)

        if (activationError) {
            console.error('Failed to activate seller account:', activationError)
            return { error: 'Gagal mengaktifkan akun seller' }
        }

        console.log('✅ Seller account activated for user:', user.email)

        revalidatePath('/dashboard')

        return { success: true }
    } catch (error) {
        console.error('Error in verifyCodeAndActivate:', error)
        return { error: 'Terjadi kesalahan saat verifikasi' }
    }
}
