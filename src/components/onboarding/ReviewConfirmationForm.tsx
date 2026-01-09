'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowRight, Edit } from 'lucide-react'

export function ReviewConfirmationForm() {
    const router = useRouter()
    const [agreed, setAgreed] = useState(false)

    function handleEdit() {
        router.push('/onboarding/seller')
    }

    function handleContinue() {
        if (agreed) {
            router.push('/onboarding/email-verification')
        }
    }

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white">
            <CardContent className="p-8 space-y-6">
                {/* Terms Checkbox */}
                <div className="p-4 border-2 border-black bg-gray-50 rounded-sm">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="terms"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                            className="mt-0.5 h-5 w-5 shrink-0 border-2 border-black data-[state=checked]:bg-cyan-400 data-[state=checked]:border-black"
                        />
                        <Label
                            htmlFor="terms"
                            className="font-medium text-sm cursor-pointer leading-relaxed flex-1"
                        >
                            Saya menyatakan bahwa data di atas adalah <strong>benar</strong> dan saya setuju dengan{' '}
                            <a href="/terms" target="_blank" className="text-cyan-600 font-bold underline">
                                Syarat & Ketentuan Asetia
                            </a>.
                        </Label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={handleEdit}
                        variant="outline"
                        className="flex-1 border-2 border-black font-bold rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-12"
                    >
                        <Edit className="mr-2 h-5 w-5" />
                        Edit Data
                    </Button>

                    <Button
                        onClick={handleContinue}
                        disabled={!agreed}
                        className="flex-1 bg-cyan-400 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Lanjut ke Verifikasi Email
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                {/* Warning Message */}
                {!agreed && (
                    <p className="text-xs text-center text-muted-foreground font-medium">
                        Centang kotak di atas untuk melanjutkan
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
