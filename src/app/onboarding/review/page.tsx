import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewConfirmationForm } from '@/components/onboarding/ReviewConfirmationForm'
import { CheckCircle } from 'lucide-react'

export default async function ReviewPage() {
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

    // Generate signed URL for selfie thumbnail
    let selfieUrl = null
    if (profile.selfie_path) {
        const { data } = await supabase.storage
            .from('id-verifications')
            .createSignedUrl(profile.selfie_path, 3600) // 1 hour expiry

        selfieUrl = data?.signedUrl || null
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                        Review & Konfirmasi
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Periksa kembali data Anda sebelum melanjutkan
                    </p>
                </div>

                {/* Review Card */}
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-gradient-to-br from-yellow-50 to-green-50 mb-6">
                    <CardHeader className="border-b-4 border-black bg-yellow-100">
                        <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
                            <CheckCircle className="h-6 w-6" />
                            Data Toko & Pribadi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {/* Store Details */}
                        <div className="p-4 border-2 border-black bg-white rounded-sm">
                            <h3 className="font-black uppercase text-sm mb-3 text-cyan-600">📦 Informasi Toko</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="font-black text-xs uppercase text-muted-foreground">Nama Toko:</p>
                                    <p className="font-bold text-lg">{profile.store_name}</p>
                                </div>
                                <div>
                                    <p className="font-black text-xs uppercase text-muted-foreground">Bio Toko:</p>
                                    <p className="font-medium text-sm">{profile.store_bio}</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="p-4 border-2 border-black bg-white rounded-sm">
                            <h3 className="font-black uppercase text-sm mb-3 text-blue-600">👤 Informasi Pribadi</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="font-black text-xs uppercase text-muted-foreground">Nomor Telepon:</p>
                                    <p className="font-bold">{profile.phone_number || 'Tidak tersedia'}</p>
                                </div>
                                <div>
                                    <p className="font-black text-xs uppercase text-muted-foreground">Alamat Rumah:</p>
                                    <p className="font-medium text-sm">{profile.home_address || 'Tidak tersedia'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Selfie Thumbnail */}
                        {selfieUrl && (
                            <div className="p-4 border-2 border-black bg-white rounded-sm">
                                <h3 className="font-black uppercase text-sm mb-3 text-green-600">📸 Foto Selfie</h3>
                                <div className="border-4 border-black rounded-sm overflow-hidden w-48 h-48">
                                    <img
                                        src={selfieUrl}
                                        alt="Selfie Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Confirmation Form */}
                <ReviewConfirmationForm />

                {/* Progress Info */}
                <div className="mt-8 p-6 border-2 border-black bg-blue-50 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black uppercase mb-2">📋 Progress Onboarding</h3>
                    <ul className="space-y-2 text-sm font-medium">
                        <li className="text-green-600">✅ <strong>Phase 1:</strong> Setup Toko - Selesai</li>
                        <li className="text-green-600">✅ <strong>Phase 2:</strong> Verifikasi Identitas - Selesai</li>
                        <li className="text-yellow-600">⏳ <strong>Review:</strong> Konfirmasi Data - Sedang Berlangsung</li>
                        <li>⏳ <strong>Phase 3:</strong> Verifikasi Email - Menunggu</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
