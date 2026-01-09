import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/cart/CartIcon'

export async function PublicNavbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-3xl font-black uppercase tracking-tighter hover:text-primary transition-colors">
                    Asetia
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <CartIcon />
                            <Link href="/dashboard">
                                <Button className="bg-primary text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase">
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/dashboard/settings">
                                <Button variant="outline" className="font-bold border-2 border-black rounded-sm uppercase hover:bg-black hover:text-white transition-colors">
                                    Profile
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" className="font-bold border-2 border-black rounded-sm uppercase hover:bg-black hover:text-white transition-colors">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button className="bg-primary text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
