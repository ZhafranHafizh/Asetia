'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { CartIconClient } from "@/components/cart/CartIconClient"

export function Header() {
    const router = useRouter()
    const supabase = createClient()
    const pathName = usePathname()
    const searchParams = useSearchParams()

    // Detect mode
    const modeFromParams = searchParams.get('mode')
    const isSellerPath = pathName.startsWith('/dashboard/seller') || pathName.startsWith('/dashboard/products') || pathName.startsWith('/dashboard/earnings')
    const mode = modeFromParams || (isSellerPath ? 'seller' : 'buyer')
    const isSeller = mode === 'seller'

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header className="h-16 border-b-2 border-neo bg-background px-6 flex items-center justify-between ml-64">
            <h2 className="font-bold text-lg uppercase tracking-tight">Dashboard</h2>

            <div className="flex items-center gap-4">
                {/* Only show Cart in Buyer Mode */}
                {!isSeller && <CartIconClient />}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-black hover:shadow-neo transition-all p-0 overflow-hidden">
                            <Avatar className="h-full w-full">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback className="font-bold bg-secondary text-black">CN</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 border-2 border-neo shadow-neo rounded-sm" align="end" forceMount>
                        <DropdownMenuLabel className="font-bold uppercase">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-black" />
                        <DropdownMenuItem className="font-medium cursor-pointer focus:bg-primary focus:text-black">
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-medium cursor-pointer focus:bg-primary focus:text-black">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black" />
                        <DropdownMenuItem onClick={handleLogout} className="font-bold text-destructive focus:bg-destructive focus:text-white cursor-pointer">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
