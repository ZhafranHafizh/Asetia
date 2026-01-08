'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
    totalPages: number
    currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-4 mt-8">
            <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => router.push(createPageURL(currentPage - 1))}
                className="border-2 border-black rounded-sm font-bold uppercase hover:bg-gray-100 disabled:opacity-50"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
            </Button>

            <div className="flex items-center gap-2">
                <span className="font-black text-lg border-2 border-black bg-white px-3 py-1 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {currentPage}
                </span>
                <span className="font-bold text-gray-500">of</span>
                <span className="font-bold text-lg">{totalPages}</span>
            </div>

            <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => router.push(createPageURL(currentPage + 1))}
                className="border-2 border-black rounded-sm font-bold uppercase hover:bg-gray-100 disabled:opacity-50"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    )
}
