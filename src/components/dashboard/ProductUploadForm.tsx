'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createProduct } from '@/app/dashboard/products/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function ProductUploadForm({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setStatus('Uploading files...')

        const form = e.currentTarget
        const formData = new FormData(form)

        const previewFile = (form.elements.namedItem('preview') as HTMLInputElement).files?.[0]
        const assetFile = (form.elements.namedItem('asset') as HTMLInputElement).files?.[0]

        if (!previewFile || !assetFile) {
            setStatus('Please select both a preview image and an asset file.')
            setLoading(false)
            return
        }

        const supabase = createClient()

        try {
            // 1. Upload Preview
            const previewName = `${Date.now()}_${previewFile.name}`
            const { data: previewData, error: previewError } = await supabase.storage
                .from('assets')
                .upload(`previews/${userId}/${previewName}`, previewFile)

            if (previewError) throw previewError

            // 2. Upload Asset
            const assetName = `${Date.now()}_${assetFile.name}`
            const { data: assetData, error: assetError } = await supabase.storage
                .from('assets')
                .upload(`files/${userId}/${assetName}`, assetFile)

            if (assetError) throw assetError

            // 4. Submit Metadata
            setStatus('Saving product details...')

            // Create a Clean FormData to send to Server Action (exclude large files)
            const serverFormData = new FormData()
            serverFormData.append('title', formData.get('title') as string)
            serverFormData.append('description', formData.get('description') as string)
            serverFormData.append('price', formData.get('price') as string)
            serverFormData.append('seller_id', userId)
            serverFormData.append('file_path', assetData.path)
            serverFormData.append('preview_url', previewData.path) // Store path only

            const result = await createProduct(serverFormData)
            if (result?.error) {
                throw new Error(result.error)
            }

        } catch (error: any) {
            console.error('Upload failed:', error)
            setStatus(`Error: ${error.message}`)
            setLoading(false)
        }
    }

    return (
        <Card className="border-2 border-neo shadow-neo rounded-sm">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-bold uppercase">Product Title</Label>
                        <Input id="title" name="title" required className="border-2 border-neo rounded-sm" placeholder="e.g. Neo-Brutalist UI Kit" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold uppercase">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            className="flex min-h-[80px] w-full rounded-sm border-2 border-neo bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe your asset..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price" className="font-bold uppercase">Price (IDR)</Label>
                        <Input id="price" name="price" type="number" required className="border-2 border-neo rounded-sm" placeholder="100000" />
                    </div>

                    <div>
                        <Label htmlFor="category" className="font-bold uppercase">Category</Label>
                        <select
                            id="category"
                            name="category"
                            required
                            className="flex h-10 w-full rounded-sm border-2 border-neo bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select a category...</option>
                            <option value="UI Kit">UI Kit</option>
                            <option value="Source Code">Source Code</option>
                            <option value="Canva Template">Canva Template</option>
                            <option value="E-Book">E-Book</option>
                            <option value="Icon Pack">Icon Pack</option>
                            <option value="Font">Font</option>
                            <option value="Mockup">Mockup</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <Label className="font-bold uppercase mb-3 block">Sale Type</Label>
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 p-4 border-2 border-black rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="sale_type"
                                    value="unlimited"
                                    defaultChecked
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-black uppercase">Unlimited Sales</p>
                                    <p className="text-sm font-medium text-gray-600">Multiple buyers can purchase this asset</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 p-4 border-2 border-black rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="sale_type"
                                    value="one_time"
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-black uppercase">One-Time Sale (Exclusive)</p>
                                    <p className="text-sm font-medium text-gray-600">Only one buyer can purchase this asset</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="preview" className="font-bold uppercase">Preview Image</Label>
                            <Input
                                id="preview"
                                name="preview"
                                type="file"
                                accept="image/*"
                                required
                                className="border-2 border-neo rounded-sm font-medium"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Publicly visible cover image.</p>
                        </div>

                        <div>
                            <Label htmlFor="asset" className="font-bold uppercase">Asset File (ZIP)</Label>
                            <Input
                                id="asset"
                                name="asset"
                                type="file"
                                accept=".zip"
                                required
                                className="border-2 border-neo rounded-sm font-medium"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Secure file delivered after purchase.</p>
                        </div>
                    </div>

                    {status && (
                        <div className={`p-4 font-bold border-2 border-black rounded-sm ${status.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/20'}`}>
                            {status}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase h-12"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {status}
                            </>
                        ) : (
                            'Upload Product'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
