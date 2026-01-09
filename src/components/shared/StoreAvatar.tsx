'use client'

interface StoreAvatarProps {
    storeName: string
    logoUrl?: string | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const sizeClasses = {
    sm: 'h-10 w-10 text-lg',
    md: 'h-12 w-12 text-xl',
    lg: 'h-16 w-16 text-3xl',
    xl: 'h-24 w-24 text-5xl'
}

export function StoreAvatar({ storeName, logoUrl, size = 'md', className = '' }: StoreAvatarProps) {
    const initial = storeName?.charAt(0).toUpperCase() || 'S'
    const sizeClass = sizeClasses[size]

    // Generate consistent color based on store name
    const getColorFromName = (name: string) => {
        const colors = [
            'from-yellow-400 to-orange-500',
            'from-lime-400 to-green-500',
            'from-cyan-400 to-blue-500',
            'from-pink-400 to-purple-500',
            'from-red-400 to-rose-500',
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    const gradientColor = getColorFromName(storeName || 'Store')

    if (logoUrl) {
        return (
            <div className={`${sizeClass} border-2 border-black rounded-sm overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}>
                <img
                    src={logoUrl}
                    alt={`${storeName} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initial avatar if image fails
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center"><span class="font-black text-white">${initial}</span></div>`
                        }
                    }}
                />
            </div>
        )
    }

    // Default: Dynamic initial avatar
    return (
        <div className={`${sizeClass} border-2 border-black rounded-sm overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br ${gradientColor} flex items-center justify-center ${className}`}>
            <span className="font-black text-white">
                {initial}
            </span>
        </div>
    )
}
