'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateSellerProfile, uploadStoreLogo } from '@/app/dashboard/seller/settings/actions'
import { Loader2, Store, User, Phone, MapPin, Upload, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface SellerSettingsFormProps {
    profile: any
    userId: string
}

export function SellerSettingsForm({ profile, userId }: SellerSettingsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    // Get logo URL if exists
    const getLogoUrl = async () => {
        if (!profile.store_logo) return null

        const supabase = createClient()
        const { data } = await supabase.storage
            .from('assets')
            .createSignedUrl(profile.store_logo, 3600)

        return data?.signedUrl || null
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateSellerProfile(formData)

        setIsLoading(false)

        if (result.error) {
            setError(result.error)
        } else if (result.success) {
            setSuccess('Profile updated successfully! ✓')
            setTimeout(() => setSuccess(null), 3000)
            router.refresh()
        }
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingLogo(true)
        setError(null)
        setSuccess(null)

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setLogoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        const formData = new FormData()
        formData.append('logo', file)

        const result = await uploadStoreLogo(formData)

        setIsUploadingLogo(false)

        if (result.error) {
            setError(result.error)
            setLogoPreview(null)
        } else if (result.success) {
            setSuccess('Logo uploaded successfully! ✓')
            // Keep the preview, it will refresh on page reload
            setTimeout(() => setSuccess(null), 3000)
            router.refresh()
        }
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
                    {/* Store Logo */}
                    <div className="space-y-2">
                        <Label className="font-black uppercase text-sm">Store Logo</Label>
                        <div className="flex items-center gap-4">
                            <div className="h-24 w-24 border-4 border-black rounded-sm overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Store Logo Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : profile.store_logo ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${profile.store_logo}`}
                                        alt="Store Logo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to default avatar if image fails to load
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-5xl font-black text-white">
                                            {profile.store_name?.charAt(0).toUpperCase() || 'S'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    disabled={isUploadingLogo}
                                    className="border-2 border-black rounded-sm font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                                <p className="text-xs text-muted-foreground font-medium mt-1">
                                    Max 2MB • PNG, JPG, or WEBP
                                </p>
                                {isUploadingLogo && (
                                    <p className="text-xs text-cyan-600 font-bold mt-1 flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading logo...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

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
                            defaultValue={profile.store_name || ''}
                            placeholder="e.g., Guardian Studio"
                            className="border-2 border-black rounded-sm font-medium h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
                            disabled={isLoading}
                        />
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
                            defaultValue={profile.store_bio || ''}
                            placeholder="Tell buyers about your store..."
                            className="border-2 border-black rounded-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 resize-none"
                            disabled={isLoading}
                        />
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
                                defaultValue={profile.phone_number?.replace('+62', '') || ''}
                                placeholder="812345678"
                                className="flex-1 border-2 border-black rounded-sm font-medium h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Home Address */}
                    <div className="space-y-2">
                        <Label htmlFor="home_address" className="font-black uppercase text-sm">
                            Home Address * <span className="text-xs text-muted-foreground font-medium">(Private)</span>
                        </Label>
                        <Textarea
                            id="home_address"
                            name="home_address"
                            required
                            minLength={20}
                            maxLength={300}
                            rows={4}
                            defaultValue={profile.home_address || ''}
                            placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
                            className="border-2 border-black rounded-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 resize-none"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground font-medium">
                            This information is kept private and only used for verification purposes
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-4 border-2 border-red-500 bg-red-50 rounded-sm">
                            <p className="text-red-700 font-bold text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 border-2 border-green-500 bg-green-50 rounded-sm">
                            <p className="text-green-700 font-bold text-sm">{success}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading || isUploadingLogo}
                        className="w-full bg-cyan-400 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
