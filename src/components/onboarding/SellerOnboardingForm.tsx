'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitSellerOnboarding } from '@/app/onboarding/seller/actions'
import { Loader2, Store, ArrowRight } from 'lucide-react'

export function SellerOnboardingForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await submitSellerOnboarding(formData)

        setIsLoading(false)

        if (result.error) {
            setError(result.error)
        } else if (result.success) {
            setSuccess(true)
        }
    }

    if (success) {
        return (
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-400 border-4 border-black rounded-full mx-auto flex items-center justify-center mb-4">
                            <Store className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black uppercase mb-2">Success!</h2>
                        <p className="text-muted-foreground font-medium">
                            Your store details have been submitted. Now let's verify your identity.
                        </p>
                    </div>

                    <Button
                        onClick={() => router.push('/onboarding/verification')}
                        className="bg-cyan-400 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 px-8"
                    >
                        Proceed to Identity Verification
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-gray-50">
                <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
                    <Store className="h-6 w-6" />
                    Store Information
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Store Name */}
                    <div className="space-y-2">
                        <Label htmlFor="store_name" className="font-black uppercase text-sm">
                            Store Name *
                        </Label>
                        <Input
                            id="store_name"
                            name="store_name"
                            type="text"
                            required
                            minLength={3}
                            maxLength={50}
                            placeholder="e.g., Creative Studio, Design Hub"
                            className="border-2 border-black rounded-sm font-medium h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground font-medium">
                            This will be your unique store identifier (3-50 characters)
                        </p>
                    </div>

                    {/* Store Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="store_bio" className="font-black uppercase text-sm">
                            Store Bio *
                        </Label>
                        <Textarea
                            id="store_bio"
                            name="store_bio"
                            required
                            minLength={10}
                            maxLength={500}
                            rows={5}
                            placeholder="Tell buyers about your store, what you sell, and what makes your assets unique..."
                            className="border-2 border-black rounded-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 resize-none"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground font-medium">
                            Minimum 10 characters, maximum 500 characters
                        </p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone_number" className="font-black uppercase text-sm">
                            Phone Number *
                        </Label>
                        <div className="flex gap-2">
                            <div className="w-20 border-2 border-black rounded-sm font-bold h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center bg-gray-100">
                                +62
                            </div>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                required
                                minLength={9}
                                maxLength={13}
                                placeholder="812345678"
                                className="flex-1 border-2 border-black rounded-sm font-medium h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
                                disabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Nomor telepon untuk keperluan verifikasi dan komunikasi
                        </p>
                    </div>

                    {/* Home Address */}
                    <div className="space-y-2">
                        <Label htmlFor="home_address" className="font-black uppercase text-sm">
                            Home Address *
                        </Label>
                        <Textarea
                            id="home_address"
                            name="home_address"
                            required
                            minLength={20}
                            maxLength={300}
                            rows={4}
                            placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
                            className="border-2 border-black rounded-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 resize-none"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground font-medium">
                            Alamat lengkap untuk keperluan verifikasi (min. 20 karakter)
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 border-2 border-red-500 bg-red-50 rounded-sm">
                            <p className="text-red-700 font-bold text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Continue to Verification'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
