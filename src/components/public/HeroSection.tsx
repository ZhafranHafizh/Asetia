'use client'

import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'

export function HeroSection() {
    const scrollToProducts = () => {
        const productsSection = document.getElementById('products')
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section className="bg-primary border-b-4 border-black py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-6 text-white"
                    style={{
                        textShadow: '6px 6px 0px rgba(0,0,0,1)',
                        WebkitTextStroke: '3px black'
                    }}>
                    Marketplace Aset Digital<br />Paling Lokal
                </h1>

                <p className="text-xl md:text-2xl font-bold mb-8 max-w-2xl mx-auto">
                    Jual beli aset digital berkualitas dari kreator Indonesia. UI Kit, Source Code, Template, dan lainnya.
                </p>

                <Button
                    onClick={scrollToProducts}
                    className="bg-black text-white font-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm uppercase text-lg px-8 py-6 h-auto"
                >
                    Start Exploring
                    <ArrowDown className="ml-2 h-6 w-6" />
                </Button>
            </div>
        </section>
    )
}
