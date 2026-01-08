'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SuccessNotification() {
    const [show, setShow] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    if (!show) return null

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
            <div className="bg-cyan-500 text-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm p-4 max-w-md">
                <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-black uppercase text-lg">Pembelian Berhasil!</h3>
                        <p className="font-bold mt-1">Aset sudah tersedia di Library Anda.</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShow(false)}
                        className="h-6 w-6 p-0 hover:bg-cyan-600 rounded-sm"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
