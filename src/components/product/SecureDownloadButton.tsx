'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { getSecureDownloadUrl } from '@/app/product/actions'

interface SecureDownloadButtonProps {
    productId: string
}

export function SecureDownloadButton({ productId }: SecureDownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            const result = await getSecureDownloadUrl(productId)

            if (result.error) {
                alert(result.error)
                return
            }

            if (result.url) {
                // Trigger download by creating a temporary anchor tag
                const link = document.createElement('a')
                link.href = result.url
                link.download = '' // Let browser decide name or use Content-Disposition
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        } catch (err) {
            console.error('Download failed:', err)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleDownload}
            disabled={isLoading}
            className="w-full bg-green-500 text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm h-16 text-lg uppercase"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Generating Link...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-6 w-6" />
                    Download Files
                </>
            )}
        </Button>
    )
}
