import { useState, useEffect } from 'react';
import { AdData } from '@/components/AdSlot';

export const useAdStore = (communityId: string = 'default') => {
    const [ads, setAds] = useState<AdData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from API on mount or when communityId changes
    useEffect(() => {
        const fetchAds = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/ads?community=${communityId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAds(data);
                }
            } catch (error) {
                console.error('Failed to fetch ads:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAds();
    }, [communityId]);

    const saveAds = async (newAds: AdData[]) => {
        setAds(newAds); // Optimistic update
        try {
            await fetch('/api/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ community: communityId, ads: newAds }),
            });
        } catch (error) {
            console.error('Failed to save ads:', error);
            // Revert on error? For now, keep optimistic.
        }
    };

    const addAd = (ad: AdData) => {
        const newAds = [ad, ...ads];
        saveAds(newAds);
    };

    const removeAd = (index: number) => {
        const newAds = ads.filter((_, i) => i !== index);
        saveAds(newAds);
    };

    const updateAd = (index: number, updatedAd: AdData) => {
        const newAds = [...ads];
        newAds[index] = updatedAd;
        saveAds(newAds);
    };

    return { ads, addAd, removeAd, updateAd, isLoading };
};
