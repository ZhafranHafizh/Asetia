import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SellerOnboardingForm } from '@/components/onboarding/SellerOnboardingForm'

export default async function SellerOnboardingPage() {
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

    // If already submitted onboarding (verification_status is not 'none'), redirect to verification page
    if (profile?.verification_status && profile.verification_status !== 'none') {
        redirect('/onboarding/verification')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                        Become a Seller
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Set up your store and start selling digital assets on Asetia
                    </p>
                </div>

                {/* Onboarding Form */}
                <SellerOnboardingForm />

                {/* Info Box */}
                <div className="mt-8 p-6 border-2 border-black bg-yellow-50 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black uppercase mb-2">📋 What's Next?</h3>
                    <ul className="space-y-2 text-sm font-medium">
                        <li>✅ <strong>Phase 1:</strong> Store Setup (You are here)</li>
                        <li>⏳ <strong>Phase 2:</strong> Identity Verification</li>
                        <li>⏳ <strong>Phase 3:</strong> Review & Approval</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
