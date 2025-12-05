"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink } from 'lucide-react';

export interface AdData {
    isActive: boolean;
    advertiser: string;
    offer: string;
    qrContent: string;
    contact: string;
    address?: string;
    phone?: string;
    expiresAt?: number; // Timestamp
    image?: string;
    hasRedeem?: boolean;
}

interface AdSlotProps {
    data: AdData;
    onOpenChange?: (isOpen: boolean) => void;
}

export default function AdSlot({ data, onOpenChange }: AdSlotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
        if (!open) setShowQR(false); // Reset QR state on close
    };

    if (!data.isActive) {
        return (
            <div className="w-full p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center space-y-2 bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer">
                <p className="font-semibold text-muted-foreground">广告位招租</p>
                <p className="text-xs text-muted-foreground opacity-70">{data.contact}</p>
            </div>
        );
    }

    return (
        <>
            {/* Banner */}
            <div
                onClick={() => handleOpenChange(true)}
                className="w-full p-4 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    {data.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/50 shrink-0">
                            <img src={data.image} alt={data.advertiser} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-yellow-900 flex items-center gap-2">
                            {data.advertiser}
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-full uppercase tracking-wider">Ad</span>
                        </h3>
                        <p className="text-sm text-yellow-800/80 line-clamp-1">{data.offer}</p>
                    </div>
                </div>
                <ExternalLink className="text-yellow-900 opacity-50 group-hover:opacity-100 transition-opacity" size={20} />
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => handleOpenChange(false)}
                            className="absolute top-3 right-3 p-1.5 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="overflow-y-auto flex-1">
                            {/* Hero Image */}
                            {data.image ? (
                                <div className="w-full aspect-video bg-gray-100 relative">
                                    <img
                                        src={data.image}
                                        alt={data.advertiser}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4 text-white">
                                        <h2 className="text-xl font-bold mb-1">{data.advertiser}</h2>
                                        {data.offer && (
                                            <div className="inline-block px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                                                {data.offer}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-32 bg-gradient-to-br from-amber-200 to-yellow-400 flex items-end p-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-yellow-900 mb-1">{data.advertiser}</h2>
                                        <p className="text-yellow-800 text-sm font-medium">{data.offer}</p>
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5 space-y-5">
                                {/* Contact Info */}
                                {(data.address || data.phone) && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider text-gray-400">商家信息</h3>
                                        <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                                            {data.address && (
                                                <div className="flex items-start gap-2.5">
                                                    <span className="text-lg shrink-0">📍</span>
                                                    <div>
                                                        <p className="text-gray-900 font-medium leading-tight">{data.address}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {data.phone && (
                                                <div className="flex items-center gap-2.5 pt-2 border-t border-gray-200">
                                                    <span className="text-lg shrink-0">📞</span>
                                                    <div>
                                                        <a href={`tel:${data.phone}`} className="text-blue-600 font-medium hover:underline">
                                                            {data.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* QR Code Section (Conditional) */}
                                {data.hasRedeem && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider text-gray-400">优惠核销</h3>
                                        {!showQR ? (
                                            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-2xl">
                                                    🎁
                                                </div>
                                                <p className="text-indigo-900 font-medium text-sm mb-3">
                                                    到店出示二维码享受优惠
                                                </p>
                                                <button
                                                    onClick={() => setShowQR(true)}
                                                    className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-sm"
                                                >
                                                    立即核销
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-white border-2 border-dashed border-indigo-200 rounded-xl p-4 text-center animate-in zoom-in-95 duration-300">
                                                <p className="text-xs text-gray-500 mb-3">请向店员出示此二维码</p>
                                                <div className="bg-white p-2 inline-block rounded-xl shadow-sm border border-gray-100">
                                                    <QRCodeSVG value={data.qrContent} size={160} />
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-3">
                                                    有效期至：{new Date(data.expiresAt || Date.now()).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
