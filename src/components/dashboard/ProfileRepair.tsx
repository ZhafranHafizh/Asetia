'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function ProfileRepair() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [msg, setMsg] = useState('')

    const handleRepair = async () => {
        setStatus('loading')
        const supabase = createClient()

        // 1. Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            setStatus('error')
            setMsg('Could not fetch auth user.')
            return
        }

        // 2. Insert/Upsert into profiles
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            username: user.email, // fallback
            role: 'seller' // Defaulting to seller since they are on this page
        })

        if (profileError) {
            setStatus('error')
            setMsg(profileError.message)
        } else {
            setStatus('success')
            setMsg('Profile synced! You can now upload.')
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-100 border-2 border-green-600 p-4 rounded-sm flex items-center mb-6">
                <CheckCircle className="h-5 w-5 mr-2 text-green-700" />
                <p className="font-bold text-green-800">{msg}</p>
            </div>
        )
    }

    return (
        <div className="bg-yellow-100 border-2 border-yellow-600 p-4 rounded-sm mb-6">
            <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-800 mt-1" />
                <div>
                    <h3 className="font-bold text-yellow-900 uppercase">Emergency Fix</h3>
                    <p className="text-yellow-800 text-sm mb-3">
                        If you are seeing a "Foreign Key Constraint" error, your user profile might be missing from the database. Click below to fix it.
                    </p>
                    <Button
                        onClick={handleRepair}
                        disabled={status === 'loading'}
                        size="sm"
                        className="bg-yellow-500 text-black border-2 border-black hover:bg-yellow-400 font-bold"
                    >
                        {status === 'loading' ? 'Syncing...' : 'Sync Profile Data'}
                    </Button>
                    {status === 'error' && <p className="text-red-600 font-bold text-xs mt-2">{msg}</p>}
                </div>
            </div>
        </div>
    )
}
