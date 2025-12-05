import { useState, useEffect } from 'react';
import { AdData } from '@/components/AdSlot';

const STORAGE_KEY = 'snapsell_ads';

export const useAdStore = () => {
    const [ads, setAds] = useState<AdData[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setAds(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse ads', e);
            }
        }
    }, []);

    const addAd = (ad: AdData) => {
        setAds(prev => {
            const newAds = [ad, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newAds));
            return newAds;
        });
    };

    const removeAd = (index: number) => {
        setAds(prev => {
            const newAds = prev.filter((_, i) => i !== index);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newAds));
            return newAds;
        });
    };

    return { ads, addAd, removeAd };
};
