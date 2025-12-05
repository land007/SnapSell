"use client";

import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';

export interface LoadingAdProps {
    isOpen: boolean;
    isMinimized?: boolean;
    type: 'image' | 'video';
    src: string;
    link: string;
    advertiser: string;
    description: string;
    onClose?: () => void;
}

export default function LoadingAd({
    isOpen,
    isMinimized = false,
    type,
    src,
    link,
    advertiser,
    description,
    onClose
}: LoadingAdProps) {
    const [progress, setProgress] = useState(0);

    // Reset progress when opened
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return prev; // Cap at 95% until actually done
                    return prev + 2; // Simulate progress
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isOpen, isMinimized]);

    if (!isOpen) return null;

    // Minimized State
    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-[50] w-72 bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="relative h-40 group cursor-pointer">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                        {type === 'video' ? (
                            <video
                                src={src}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={src}
                                alt={advertiser}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </a>

                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose?.();
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                        <X size={14} />
                    </button>

                    {/* Badge */}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-medium rounded">
                        广告
                    </span>
                </div>

                <div className="p-3 bg-white">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-900 truncate pr-2">{advertiser}</h4>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-violet-600 font-medium hover:underline flex items-center gap-0.5"
                        >
                            查看 <ExternalLink size={10} />
                        </a>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{description}</p>
                </div>
            </div>
        );
    }

    // Expanded State (Modal)
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border border-border">

                {/* Header: Progress & Status */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                        </div>
                        <span className="font-medium text-sm text-gray-700">AI 正在识别好物...</span>
                    </div>
                    {/* In expanded mode, we might not want to allow closing if it's "loading",
                        but if we do, we can uncomment this. For now, let's keep it non-closable during load
                        to ensure they see the ad, or allow it if user really wants to abort?
                        Let's hide close button in expanded mode as per original design implies "waiting".
                        Actually, let's allow close if passed, but typically we control this via parent.
                    */}
                </div>

                {/* Ad Content */}
                <div className="relative aspect-[4/5] bg-gray-100 mt-[56px]"> {/* Offset for header */}
                    {type === 'video' ? (
                        <video
                            src={src}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={src}
                            alt={advertiser}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Ad Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 rounded text-[10px] font-medium uppercase tracking-wider">
                                广告
                            </span>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-medium hover:underline opacity-90 hover:opacity-100 transition-opacity"
                            >
                                了解详情 <ExternalLink size={12} />
                            </a>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{advertiser}</h3>
                        <p className="text-sm text-white/80 line-clamp-2">{description}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 w-full">
                    <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
