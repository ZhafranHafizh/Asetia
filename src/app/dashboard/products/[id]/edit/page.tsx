import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductEditForm } from '@/components/dashboard/ProductEditForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('seller_id', user.id)
        .single()

    if (error || !product) {
        redirect('/dashboard/products?mode=seller')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/products?mode=seller">
                    <Button variant="ghost" className="border-2 border-transparent hover:border-black hover:bg-transparent">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Edit Asset</h1>
            </div>

            <ProductEditForm product={product} />
        </div>
    )
}
