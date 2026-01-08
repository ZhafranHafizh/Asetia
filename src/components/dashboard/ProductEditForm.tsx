'use client'

import { useState } from 'react'
import { updateProduct } from '@/app/dashboard/products/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProductEditFormProps {
    product: {
        id: string
        title: string
        description: string | null
        price: number
        category?: string | null
        sale_type?: string | null
    }
}

export function ProductEditForm({ product }: ProductEditFormProps) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setStatus('Updating product...')

        const formData = new FormData(e.currentTarget)

        const result = await updateProduct(product.id, formData)

        if (result.error) {
            setStatus(`Error: ${result.error}`)
            setLoading(false)
        } else {
            setStatus('Update successful!')
            router.push('/dashboard/products?mode=seller')
            router.refresh()
        }
    }

    return (
        <Card className="border-2 border-neo shadow-neo rounded-sm">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-bold uppercase">Product Title</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={product.title}
                            required
                            className="border-2 border-neo rounded-sm"
                            placeholder="e.g. Neo-Brutalist UI Kit"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold uppercase">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={product.description || ''}
                            className="flex min-h-[80px] w-full rounded-sm border-2 border-neo bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe your asset..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price" className="font-bold uppercase">Price (IDR)</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            defaultValue={product.price}
                            required
                            className="border-2 border-neo rounded-sm"
                            placeholder="100000"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category" className="font-bold uppercase">Category</Label>
                        <select
                            id="category"
                            name="category"
                            defaultValue={product.category || ''}
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

                    <div className="space-y-2">
                        <Label className="font-bold uppercase">Sale Type</Label>
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 p-4 border-2 border-black rounded-sm cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="sale_type"
                                    value="unlimited"
                                    defaultChecked={product.sale_type === 'unlimited' || !product.sale_type}
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
                                    defaultChecked={product.sale_type === 'one_time'}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-black uppercase">One-Time Sale (Exclusive)</p>
                                    <p className="text-sm font-medium text-gray-600">Only one buyer can purchase this asset</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {status && (
                        <div className={`p-4 font-bold border-2 border-black rounded-sm ${status.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800'}`}>
                            {status}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 border-2 border-neo font-bold uppercase"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary text-black font-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 uppercase"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
