"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function BannerSlider({ banners = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        if (banners.length <= 1) return undefined;

        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 4500);

        return () => clearInterval(timer);
    }, [banners]);

    if (banners.length === 0) return null;

    return (
        <div className="group relative overflow-hidden bg-sky-50">
            <div className="relative aspect-[16/6] min-h-[300px] overflow-hidden sm:aspect-[21/9]">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.img
                        key={`${banners[currentIndex]}-${currentIndex}`}
                        src={banners[currentIndex]}
                        alt={`Banner ${currentIndex + 1}`}
                        custom={direction}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {banners.length > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={() => {
                            setDirection(-1);
                            setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 transition-all hover:bg-white/40 group-hover:opacity-100"
                        aria-label="Previous"
                    >
                        <FiChevronLeft size={24} />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setDirection(1);
                            setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md opacity-0 transition-all hover:bg-white/40 group-hover:opacity-100"
                        aria-label="Next"
                    >
                        <FiChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? "w-10 bg-white" : "w-3 bg-white/40 hover:bg-white/60"}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}
