'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { simulatePayment } from "@/app/checkout/actions"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface CheckoutSimulatorProps {
    transactionId: string
}

export function CheckoutSimulator({ transactionId }: CheckoutSimulatorProps) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSimulatePayment = async () => {
        setIsProcessing(true)
        setError(null)

        const result = await simulatePayment(transactionId)

        if (result.error) {
            setError(result.error)
            setIsProcessing(false)

            // If it's a race condition error, redirect to marketplace after 3 seconds
            if (result.error.includes('already been sold') || result.error.includes('just purchased')) {
                setTimeout(() => {
                    router.push('/dashboard')
                }, 3000)
            }
        } else {
            // Show success and redirect
            router.push('/dashboard/purchases?success=true')
        }
    }

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm">
            <CardHeader className="bg-cyan-500 border-b-4 border-black">
                <CardTitle className="font-black uppercase text-white">Payment Simulation</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {error && (
                    <div className="bg-red-100 border-2 border-red-600 p-4 rounded-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-black text-red-900 uppercase text-sm mb-1">Transaction Failed</p>
                                <p className="font-bold text-red-800 text-sm">{error}</p>
                                {(error.includes('already been sold') || error.includes('just purchased')) && (
                                    <p className="font-medium text-red-700 text-xs mt-2">Redirecting to marketplace...</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-yellow-50 border-2 border-black p-4 rounded-sm">
                    <p className="font-bold text-sm text-gray-800">
                        ⚠️ <span className="font-black">SIMULATION MODE</span>
                    </p>
                    <p className="text-sm font-medium text-gray-700 mt-2">
                        Midtrans integration is not yet active. Click the button below to simulate a successful payment.
                    </p>
                </div>

                <Button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="w-full bg-cyan-500 text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase h-14 text-lg"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Processing Payment...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-6 w-6" />
                            Simulate Successful Payment
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
