
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductUploadForm } from '@/components/dashboard/ProductUploadForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProfileRepair } from '@/components/dashboard/ProfileRepair'

export default async function NewProductPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Optional: Check if user is actually a seller or authorized
    // For now, we allow any logged-in user to try uploading if they are in seller mode context

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard?mode=seller">
                    <Button variant="ghost" className="border-2 border-transparent hover:border-black hover:bg-transparent">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Add New Asset</h1>
            </div>

            <ProfileRepair />
            <ProductUploadForm userId={user.id} />
        </div>
    )
}
