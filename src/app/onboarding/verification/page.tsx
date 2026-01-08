import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { SelfieUploadForm } from '@/components/onboarding/SelfieUploadForm'

export default async function VerificationPage() {
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

    // If not submitted store info yet, redirect back to seller onboarding
    if (!profile?.store_name || profile.verification_status === 'none') {
        redirect('/onboarding/seller')
    }

    // If already verified, redirect to seller dashboard
    if (profile.verification_status === 'verified') {
        redirect('/dashboard?mode=seller')
    }

    // Check if selfie is already uploaded
    const hasSelfie = !!profile.selfie_path

    // If selfie uploaded, redirect to email verification
    if (hasSelfie && profile.verification_status === 'pending') {
        redirect('/onboarding/email-verification')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                        Verifikasi Identitas
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Phase 2: Upload Foto Selfie
                    </p>
                </div>

                {/* Main Content */}
                {profile.verification_status === 'pending' && hasSelfie ? (
                    // Already uploaded selfie - show status
                    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white mb-8">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-yellow-400 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-4">
                                    <Clock className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black uppercase mb-2">Sedang Ditinjau</h2>
                                <p className="text-muted-foreground font-medium mb-6">
                                    Aplikasi seller Anda sedang ditinjau oleh tim kami.
                                    Proses ini biasanya memakan waktu 1-3 hari kerja.
                                </p>
                                <div className="p-4 border-2 border-black bg-gray-50 rounded-sm text-left">
                                    <p className="font-bold mb-2">Detail Toko:</p>
                                    <p className="text-sm"><strong>Nama Toko:</strong> {profile.store_name}</p>
                                    <p className="text-sm mt-1"><strong>Status:</strong> <span className="text-yellow-600 font-bold">Menunggu Verifikasi</span></p>
                                    <p className="text-sm mt-1"><strong>Selfie:</strong> <span className="text-green-600 font-bold">✓ Terupload</span></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : profile.verification_status === 'rejected' ? (
                    // Rejected
                    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white mb-8">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-400 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-4">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black uppercase mb-2">Aplikasi Ditolak</h2>
                                <p className="text-muted-foreground font-medium mb-6">
                                    Maaf, aplikasi seller Anda tidak disetujui.
                                    Silakan hubungi support untuk informasi lebih lanjut.
                                </p>
                                <Button
                                    asChild
                                    className="bg-black text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12"
                                >
                                    <Link href="/support">Hubungi Support</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Need to upload selfie
                    <SelfieUploadForm />
                )}

                {/* Progress Info */}
                <div className="mt-8 p-6 border-2 border-black bg-blue-50 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black uppercase mb-2">📋 Progress Onboarding</h3>
                    <ul className="space-y-2 text-sm font-medium">
                        <li>✅ <strong>Phase 1:</strong> Setup Toko - Selesai</li>
                        <li className={hasSelfie ? "text-green-600" : ""}>
                            {hasSelfie ? "✅" : "⏳"} <strong>Phase 2:</strong> Verifikasi Identitas - {hasSelfie ? "Selesai" : "Sedang Berlangsung"}
                        </li>
                        <li>⏳ <strong>Phase 3:</strong> Review & Persetujuan - Menunggu</li>
                    </ul>
                </div>

                {/* Back to Dashboard */}
                <div className="mt-6 text-center">
                    <Button
                        asChild
                        variant="outline"
                        className="border-2 border-black font-bold rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Link href="/dashboard">Kembali ke Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
