'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { checkDownloadEligibility, generateDownloadUrl } from '@/app/downloads/actions'

interface DownloadButtonProps {
    transactionId: string
    productTitle: string
    downloadPolicy: 'unlimited' | 'once' | 'timed'
    downloadDurationHours?: number
    purchasedAt: string
    isDownloaded?: boolean // New prop
}

export function DownloadButton({
    transactionId,
    productTitle,
    downloadPolicy,
    downloadDurationHours,
    purchasedAt,
    isDownloaded = false
}: DownloadButtonProps) {
    const [isChecking, setIsChecking] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const [canDownload, setCanDownload] = useState(false)
    const [reason, setReason] = useState<string>('')
    const [expiresAt, setExpiresAt] = useState<Date | null>(null)
    const [isDownloadedState, setIsDownloadedState] = useState(isDownloaded)

    useEffect(() => {
        checkEligibility()
    }, [transactionId])

    useEffect(() => {
        if (downloadPolicy === 'timed' && downloadDurationHours) {
            const purchasedDate = new Date(purchasedAt)
            const expiry = new Date(purchasedDate.getTime() + downloadDurationHours * 60 * 60 * 1000)
            setExpiresAt(expiry)

            // Initial check
            if (new Date() > expiry) {
                setCanDownload(false)
                setReason('Akses Berakhir')
            }
        }
    }, [purchasedAt, downloadDurationHours, downloadPolicy])

    const checkEligibility = async () => {
        setIsChecking(true)
        const result = await checkDownloadEligibility(transactionId)

        setCanDownload(result.canDownload)
        setReason(result.reason || '')

        // Update local state if server says it's downloaded/expired
        if (result.reason === 'Sudah diunduh') {
            setIsDownloadedState(true)
        }

        if (result.expiresAt) {
            setExpiresAt(new Date(result.expiresAt))
        }

        setIsChecking(false)
    }

    const handleDownload = async () => {
        setIsDownloading(true)

        const result = await generateDownloadUrl(transactionId)

        if (result.error) {
            alert(result.error)
            setIsDownloading(false)
            await checkEligibility()
            return
        }

        if (result.url) {
            const link = document.createElement('a')
            link.href = result.url
            link.download = result.filename || productTitle
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Optimistic update for "Once" policy
            if (downloadPolicy === 'once') {
                setIsDownloadedState(true)
                setCanDownload(false)
                setReason('Sudah diunduh')
            }

            setTimeout(() => {
                checkEligibility()
                setIsDownloading(false)
            }, 1000)
        }
    }

    // Styles for Disabled Button (Gray, pointer-events-none)
    const disabledStyle = "w-full bg-gray-300 text-gray-500 font-black border-2 border-gray-400 rounded-sm uppercase cursor-not-allowed pointer-events-none shadow-none"

    // Styles for Active Button (Bright Green, thick black shadow)
    const activeStyle = "w-full bg-green-500 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all rounded-sm uppercase text-sm py-6"

    if (isChecking) {
        return (
            <Button disabled className={disabledStyle}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
            </Button>
        )
    }

    // Force disable if already downloaded (for 'once' policy) or explicit 'isDownloaded' prop
    if ((downloadPolicy === 'once' && isDownloadedState) || !canDownload) {
        return (
            <div className="w-full">
                <Button disabled className={disabledStyle}>
                    {downloadPolicy === 'once' && isDownloadedState ? (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Sudah diunduh
                        </>
                    ) : (
                        <>
                            <XCircle className="mr-2 h-4 w-4" />
                            {reason || 'Unavailable'}
                        </>
                    )}
                </Button>
                {/* Optional: Show reason text below if needed, but the button label covers most cases now */}
            </div>
        )
    }

    return (
        <div className="w-full">
            <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className={activeStyle}
            >
                {isDownloading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </>
                )}
            </Button>
        </div>
    )
}
