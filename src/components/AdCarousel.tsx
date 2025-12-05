"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdSlot, { AdData } from './AdSlot';
import RentAdModal from './RentAdModal';
import { useAdStore } from '@/hooks/useAdStore';
import { AD_CONFIG } from '@/config/adConfig';

interface AdCarouselProps {
    initialAd?: AdData; // Optional initial ad (e.g., from AI result)
}

export default function AdCarousel({ initialAd }: AdCarouselProps) {
    const { ads, addAd } = useAdStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRentModalOpen, setIsRentModalOpen] = useState(false);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);

    // Combine persisted ads with optional initial ad and the fixed "Rent Me" slot
    // We want the "Rent Me" slot to always be available.
    // Let's structure the list as: [...ads, RENT_SLOT]
    // If initialAd is present and not in ads, maybe add it? 
    // For simplicity, let's just use persisted ads + Rent Slot. 
    // If initialAd is passed (e.g. Nike), we can add it to the store or just show it.
    // The requirement said "Header Ad updates to show the Nike ad". 
    // If we use Carousel, we should probably add the Nike ad to the store so it persists in the rotation?
    // Or just prepend it temporarily.

    const rentSlot: AdData = {
        isActive: false, // This triggers the "Rent Me" view in AdSlot
        advertiser: "",
        offer: "",
        qrContent: "",
        contact: "点击此处投放广告"
    };

    // Filter out expired ads
    const validAds = ads.filter(ad => {
        if (!ad.expiresAt) return true; // Permanent ads
        return ad.expiresAt > Date.now();
    });

    // Effective list of items to show
    const displayAds = [...validAds, rentSlot];

    // Auto-scroll
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isRentModalOpen && !isAdModalOpen) {
                setCurrentIndex(prev => (prev + 1) % displayAds.length);
            }
        }, AD_CONFIG.AUTO_SCROLL_INTERVAL);
        return () => clearInterval(interval);
    }, [displayAds.length, isRentModalOpen, isAdModalOpen]);

    // Sync initialAd (Nike) to store if provided and not already there?
    // Actually, the user flow is: AI finishes -> Header becomes Nike.
    // If we use Carousel, "Header becomes Nike" means Nike should probably be the *current* slide.
    // And maybe added to the list?
    useEffect(() => {
        if (initialAd && initialAd.isActive) {
            // Check if already exists to avoid dupes (simple check by advertiser)
            const exists = ads.some(a => a.advertiser === initialAd.advertiser);
            if (!exists) {
                addAd(initialAd);
                // Set current index to 0 (where we added it)
                setCurrentIndex(0);
            }
        }
    }, [initialAd]);

    const nextSlide = () => {
        setCurrentIndex(prev => (prev + 1) % displayAds.length);
    };

    const prevSlide = () => {
        setCurrentIndex(prev => (prev - 1 + displayAds.length) % displayAds.length);
    };

    const currentAd = displayAds[currentIndex];

    return (
        <div className="relative group">
            {/* Main Ad Slot */}
            <div onClick={() => !currentAd.isActive && setIsRentModalOpen(true)}>
                <AdSlot
                    data={currentAd}
                    onOpenChange={setIsAdModalOpen}
                />
            </div>

            {/* Navigation Arrows (visible on hover) */}
            {displayAds.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {displayAds.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {displayAds.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Rent Modal */}
            <RentAdModal
                isOpen={isRentModalOpen}
                onClose={() => setIsRentModalOpen(false)}
                onPublish={(newAd) => {
                    addAd(newAd);
                    setIsRentModalOpen(false);
                    setCurrentIndex(0); // Jump to new ad
                }}
            />
        </div>
    );
}
