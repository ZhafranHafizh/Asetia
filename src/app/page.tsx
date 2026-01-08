import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/public/PublicNavbar'
import { HeroSection } from '@/components/public/HeroSection'
import { ProductGrid } from '@/components/public/ProductGrid'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  // Redirect authenticated users to dashboard
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  // Fetch all products for guest view
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch seller names
  const sellerIds = products ? [...new Set(products.map(p => p.seller_id))] : []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', sellerIds)

  // Create seller lookup map
  const sellers: Record<string, string> = {}
  profiles?.forEach(profile => {
    sellers[profile.id] = profile.full_name || 'Unknown Seller'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <HeroSection />
      <ProductGrid products={products || []} sellers={sellers} />
    </div>
  )
}
