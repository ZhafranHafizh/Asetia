import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
    id: string
    created_at: string
    amount: number
    status: string
    product: {
        title: string
    }
}

interface PurchaseHistoryTableProps {
    transactions: Transaction[]
}

export function PurchaseHistoryTable({ transactions }: PurchaseHistoryTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'settlement': return 'bg-green-500 text-white'
            case 'pending': return 'bg-yellow-500 text-black'
            case 'expire': return 'bg-gray-500 text-white'
            case 'cancel': return 'bg-red-500 text-white'
            default: return 'bg-gray-300 text-black'
        }
    }

    return (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-sm">
            <CardHeader>
                <CardTitle className="font-black uppercase text-2xl">Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-2 border-black">
                            <thead className="bg-cyan-500 text-white">
                                <tr>
                                    <th className="border-2 border-black p-3 text-left font-black uppercase">Date</th>
                                    <th className="border-2 border-black p-3 text-left font-black uppercase">Product Name</th>
                                    <th className="border-2 border-black p-3 text-left font-black uppercase">Price</th>
                                    <th className="border-2 border-black p-3 text-left font-black uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-2 border-black hover:bg-gray-50">
                                        <td className="border-2 border-black p-3 font-bold">
                                            {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="border-2 border-black p-3 font-bold">
                                            {transaction.product.title}
                                        </td>
                                        <td className="border-2 border-black p-3 font-bold" suppressHydrationWarning>
                                            IDR {transaction.amount.toLocaleString()}
                                        </td>
                                        <td className="border-2 border-black p-3">
                                            <span className={`px-3 py-1 rounded-sm font-black uppercase text-xs border-2 border-black ${getStatusColor(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-black rounded-sm opacity-60">
                        <p className="font-bold text-muted-foreground">No purchase history yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
