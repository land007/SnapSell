"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink } from 'lucide-react';

export default function AdSlot() {
    const [isOpen, setIsOpen] = useState(false);

    // Mock Ad Data - In real app this could come from props or API
    const adData = {
        isActive: false, // Set to true to simulate active ad
        advertiser: "老王水果店",
        offer: "凭此码到店享 8.8 折优惠",
        qrContent: "COUPON:FRUIT_88_OFF", // The content encoded in QR
        contact: "联系管理员投放广告: 138-xxxx-xxxx"
    };

    if (!adData.isActive) {
        return (
            <div className="w-full p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center space-y-2 bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer">
                <p className="font-semibold text-muted-foreground">广告位招租</p>
                <p className="text-xs text-muted-foreground opacity-70">{adData.contact}</p>
            </div>
        );
    }

    return (
        <>
            {/* Banner */}
            <div
                onClick={() => setIsOpen(true)}
                className="w-full p-4 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-between group"
            >
                <div>
                    <h3 className="font-bold text-yellow-900 flex items-center gap-2">
                        {adData.advertiser}
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-full uppercase tracking-wider">Ad</span>
                    </h3>
                    <p className="text-sm text-yellow-800/80">{adData.offer}</p>
                </div>
                <ExternalLink className="text-yellow-900 opacity-50 group-hover:opacity-100 transition-opacity" size={20} />
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4 pt-2">
                            <h3 className="text-xl font-bold text-gray-900">{adData.advertiser}</h3>
                            <p className="text-gray-600">{adData.offer}</p>

                            <div className="p-4 bg-white border-2 border-yellow-400 rounded-xl shadow-inner">
                                <QRCodeSVG value={adData.qrContent} size={180} />
                            </div>

                            <p className="text-xs text-gray-400">请向店员出示此二维码核销</p>

                            <button
                                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
