import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SellerSettingsForm } from '@/components/seller/SellerSettingsForm'
import { Settings, CheckCircle, XCircle, Clock } from 'lucide-react'

export default async function SellerSettingsPage() {
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

    // Check if user is a seller
    if (profile?.role !== 'seller') {
        redirect('/dashboard')
    }

    // Get verification status badge
    const getVerificationBadge = () => {
        if (profile.verification_status === 'verified') {
            return (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-black uppercase">Verified</span>
                </div>
            )
        } else if (profile.verification_status === 'pending') {
            return (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Clock className="h-5 w-5" />
                    <span className="font-black uppercase">Pending</span>
                </div>
            )
        } else {
            return (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-400 border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <XCircle className="h-5 w-5" />
                    <span className="font-black uppercase">Not Verified</span>
                </div>
            )
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                        Seller Settings
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Manage your store information and profile
                    </p>
                </div>

                {/* Verification Status */}
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white mb-6">
                    <CardHeader className="border-b-4 border-black bg-gray-50">
                        <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
                            <Settings className="h-6 w-6" />
                            Account Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-black text-lg mb-2">Verification Status</p>
                                <p className="text-sm text-muted-foreground font-medium">
                                    {profile.verification_status === 'verified'
                                        ? 'Your seller account is verified and active'
                                        : profile.verification_status === 'pending'
                                            ? 'Your account is pending verification'
                                            : 'Complete onboarding to get verified'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {getVerificationBadge()}
                                {profile.verification_status !== 'verified' && (
                                    <a
                                        href="/onboarding/seller"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-lime-400 border-4 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        Verify Now
                                    </a>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Form */}
                <SellerSettingsForm profile={profile} userId={user.id} />
            </div>
        </div>
    )
}
