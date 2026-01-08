import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmailVerificationForm } from '@/components/onboarding/EmailVerificationForm'

export default async function EmailVerificationPage() {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // If not submitted store info, redirect to seller onboarding
    if (!profile?.store_name) {
        redirect('/onboarding/seller')
    }

    // If no selfie uploaded, redirect to verification
    if (!profile.selfie_path) {
        redirect('/onboarding/verification')
    }

    // If already verified, redirect to seller dashboard
    if (profile.verification_status === 'verified' && profile.role === 'seller') {
        redirect('/dashboard?mode=seller')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                        Langkah Terakhir!
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Phase 3: Verifikasi Email & Aktivasi Toko
                    </p>
                </div>

                {/* Verification Form */}
                <EmailVerificationForm userEmail={user.email || ''} />

                {/* Progress Info */}
                <div className="mt-8 p-6 border-2 border-black bg-green-50 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black uppercase mb-2">📋 Progress Onboarding</h3>
                    <ul className="space-y-2 text-sm font-medium">
                        <li className="text-green-600">✅ <strong>Phase 1:</strong> Setup Toko - Selesai</li>
                        <li className="text-green-600">✅ <strong>Phase 2:</strong> Verifikasi Identitas - Selesai</li>
                        <li>⏳ <strong>Phase 3:</strong> Verifikasi Email - Sedang Berlangsung</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
