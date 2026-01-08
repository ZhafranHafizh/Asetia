'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

const CATEGORIES = [
    'All',
    'UI Kit',
    'Source Code',
    'Canva Template',
    'E-Book',
    'Icon Pack',
    'Font',
    'Mockup',
    'Other'
]

interface CategoryFilterProps {
    onCategoryChange: (category: string) => void
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
    const [activeCategory, setActiveCategory] = useState('All')

    const handleCategoryClick = (category: string) => {
        setActiveCategory(category)
        onCategoryChange(category)
    }

    return (
        <div className="border-y-4 border-black bg-white py-6 sticky top-[73px] z-40">
            <div className="container mx-auto px-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((category) => (
                        <Button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            variant={activeCategory === category ? 'default' : 'outline'}
                            className={`
                                font-bold border-2 border-black rounded-sm uppercase whitespace-nowrap
                                ${activeCategory === category
                                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-black hover:bg-gray-100'
                                }
                                transition-all
                            `}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
