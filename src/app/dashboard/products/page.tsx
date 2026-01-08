import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { ProductCard } from '@/components/dashboard/ProductCard'

export default async function MyProductsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch Products
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">My Products</h1>
                    <p className="text-muted-foreground font-medium mt-2">
                        Manage and track your digital assets.
                    </p>
                </div>
                <Link href="/dashboard/products/new?mode=seller">
                    <Button className="bg-primary text-black font-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 px-6">
                        <Plus className="mr-2 h-5 w-5" /> ADD NEW
                    </Button>
                </Link>
            </div>

            {products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-neo rounded-sm opacity-60">
                    <h2 className="text-2xl font-black uppercase text-muted-foreground">No Products Found</h2>
                    <p className="font-medium text-muted-foreground mt-2">Start earning by uploading your first asset!</p>
                </div>
            )}
        </div>
    )
}
