'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendVerificationCode, verifyCodeAndActivate } from '@/app/onboarding/email-verification/actions'
import { Mail, Send, CheckCircle, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

export function EmailVerificationForm({ userEmail }: { userEmail: string }) {
    const router = useRouter()
    const [isSending, setIsSending] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [codeSent, setCodeSent] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [devCode, setDevCode] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSendCode() {
        setIsSending(true)
        setError(null)

        const result = await sendVerificationCode()

        setIsSending(false)

        if (result.error) {
            setError(result.error)
        } else if (result.success) {
            setCodeSent(true)
            setDevCode(result.code || null) // Store code for dev mode display
        }
    }

    async function handleVerify() {
        if (!verificationCode.trim()) {
            setError('Masukkan kode verifikasi')
            return
        }

        setIsVerifying(true)
        setError(null)

        // Simulate "System Checking..." delay
        await new Promise(resolve => setTimeout(resolve, 3000))

        const result = await verifyCodeAndActivate(verificationCode)

        setIsVerifying(false)

        if (result.error) {
            setError(result.error)
        } else if (result.success) {
            setSuccess(true)

            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            // Redirect to seller dashboard after 4 seconds (increased from 2s)
            setTimeout(() => {
                router.push('/dashboard?mode=seller&welcome=true')
            }, 4000)
        }
    }

    if (success) {
        return (
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-gradient-to-br from-green-50 to-cyan-50">
                <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-400 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-4 animate-bounce">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black uppercase mb-2">Selamat! 🎉</h2>
                    <p className="text-lg font-bold mb-2">
                        Toko Asetia Anda sudah aktif!
                    </p>
                    <p className="text-muted-foreground font-medium">
                        Mari mulai jualan aset digital paling lokal!
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-gray-50">
                <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
                    <Mail className="h-6 w-6" />
                    Verifikasi Email
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                {/* Email Display */}
                <div className="mb-6 p-4 border-2 border-black bg-blue-50 rounded-sm">
                    <p className="text-sm font-medium">
                        📧 Email Anda: <strong>{userEmail}</strong>
                    </p>
                </div>

                {!codeSent ? (
                    /* Send Code Section */
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">
                            Klik tombol di bawah untuk menerima kode verifikasi unik ke email Anda.
                        </p>

                        <Button
                            onClick={handleSendCode}
                            disabled={isSending}
                            className="w-full bg-black text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Kirim Kode Verifikasi ke Email
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    /* Verify Code Section */
                    <div className="space-y-4">
                        {/* Dev Mode Code Display */}
                        {devCode && (
                            <div className="p-4 border-2 border-yellow-500 bg-yellow-50 rounded-sm">
                                <p className="text-xs font-bold text-yellow-800 mb-1">🔧 DEV MODE - Kode Verifikasi:</p>
                                <p className="text-2xl font-black text-yellow-900 tracking-wider">{devCode}</p>
                                <p className="text-xs text-yellow-700 mt-1">Kode ini akan dikirim via email di production</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="code" className="font-black uppercase text-sm">
                                Masukkan Kode Verifikasi
                            </Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="Contoh: Aset-Lokal-45"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="border-2 border-black rounded-sm font-bold h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 uppercase"
                                disabled={isVerifying}
                            />
                            <p className="text-xs text-muted-foreground font-medium">
                                Kode berlaku selama 10 menit
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 border-2 border-red-500 bg-red-50 rounded-sm flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 font-bold text-sm">{error}</p>
                            </div>
                        )}

                        {/* Verify Button */}
                        <Button
                            onClick={handleVerify}
                            disabled={isVerifying || !verificationCode.trim()}
                            className="w-full bg-cyan-400 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 disabled:opacity-50"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    System Checking...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Verifikasi & Aktifkan Toko Saya
                                </>
                            )}
                        </Button>

                        {/* Resend Code */}
                        <Button
                            onClick={handleSendCode}
                            variant="outline"
                            disabled={isSending}
                            className="w-full border-2 border-black font-bold rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            Kirim Ulang Kode
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
