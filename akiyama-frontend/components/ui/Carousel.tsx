"use client"

import { useRef } from "react"

interface CarouselProps {
    children: React.ReactNode
}

export function Carousel({ children }: CarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef) return
        const { clientWidth } = scrollRef.current
        const scrollAmount = direction === "left" ? -clientWidth : clientWidth
        scrollRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth"})
    }

    return (
        <div className="relative group">
            <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                
            </button>
        </div>
    )
}