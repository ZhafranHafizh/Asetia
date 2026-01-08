
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingBag, DollarSign, Package } from 'lucide-react'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const supabase = await createClient()

    // Verify auth again (redundant with middleware but safe)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const mode = searchParams.mode === 'seller' ? 'seller' : 'buyer'

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">
                        {mode === 'seller' ? 'Seller Dashboard' : 'Marketplace'}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2">
                        Welcome back, <span className="text-black font-bold">{profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>.
                    </p>
                </div>

                {mode === 'seller' && (
                    <Button className="bg-primary text-black font-black border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-12 px-6">
                        <Plus className="mr-2 h-5 w-5" /> ADD NEW ASSET
                    </Button>
                )}
            </div>

            {mode === 'seller' ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 border-neo shadow-neo rounded-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">IDR {profile?.balance?.toLocaleString() || '0'}</div>
                            <p className="text-xs font-bold text-muted-foreground mt-1">+20.1% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-neo shadow-neo rounded-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase">Active Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">12</div>
                            <p className="text-xs font-bold text-muted-foreground mt-1">+2 new this week</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-neo shadow-neo rounded-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase">Total Sales</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">234</div>
                            <p className="text-xs font-bold text-muted-foreground mt-1">+19% from last month</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-1">
                    <Card className="border-2 border-neo shadow-neo rounded-sm bg-white">
                        <CardHeader>
                            <CardTitle className="font-black uppercase">Start Browsing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">Marketplace listings will appear here.</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
