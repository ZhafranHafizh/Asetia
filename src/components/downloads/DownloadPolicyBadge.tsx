import { Infinity, Download, Clock } from 'lucide-react'

interface DownloadPolicyBadgeProps {
    policy: 'unlimited' | 'once' | 'timed'
    duration?: number
}

export function DownloadPolicyBadge({ policy, duration }: DownloadPolicyBadgeProps) {
    const getBadgeStyles = () => {
        switch (policy) {
            case 'unlimited':
                return 'bg-green-400 text-black border-green-600'
            case 'once':
                return 'bg-yellow-400 text-black border-yellow-600'
            case 'timed':
                return 'bg-blue-400 text-black border-blue-600'
            default:
                return 'bg-gray-400 text-black border-gray-600'
        }
    }

    const getLabel = () => {
        switch (policy) {
            case 'unlimited':
                return 'Forever'
            case 'once':
                return '1x Download'
            case 'timed':
                return `${duration}h Access`
            default:
                return 'Unknown'
        }
    }

    const getIcon = () => {
        switch (policy) {
            case 'unlimited':
                return <Infinity className="h-3 w-3" />
            case 'once':
                return <Download className="h-3 w-3" />
            case 'timed':
                return <Clock className="h-3 w-3" />
            default:
                return null
        }
    }

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 border-2 border-black rounded-sm font-black text-xs uppercase ${getBadgeStyles()}`}>
            {getIcon()}
            <span>{getLabel()}</span>
        </div>
    )
}
