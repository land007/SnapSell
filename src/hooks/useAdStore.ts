import { useState, useEffect } from 'react';
import { AdData } from '@/components/AdSlot';

const STORAGE_KEY = 'snapsell_ads';

export const useAdStore = (communityId: string = 'default') => {
    const [ads, setAds] = useState<AdData[]>([]);
    const storageKey = `snapsell_ads_${communityId}`;

    // Load from localStorage on mount or when communityId changes
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                setAds(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse ads', e);
                setAds([]);
            }
        } else {
            setAds([]);
        }
    }, [communityId, storageKey]);

    const addAd = (ad: AdData) => {
        setAds(prev => {
            const newAds = [ad, ...prev];
            localStorage.setItem(storageKey, JSON.stringify(newAds));
            return newAds;
        });
    };

    const removeAd = (index: number) => {
        setAds(prev => {
            const newAds = prev.filter((_, i) => i !== index);
            localStorage.setItem(storageKey, JSON.stringify(newAds));
            return newAds;
        });
    };

    return { ads, addAd, removeAd };
};
