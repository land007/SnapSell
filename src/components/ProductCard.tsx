"use client";

import React, { forwardRef } from 'react';

interface ProductCardProps {
    data: {
        title: string;
        price: string;
        description: string;
        image: string | null;
    };
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ data }, ref) => {
    const { title, price, description, image } = data;

    return (
        <div
            ref={ref}
            className="w-[375px] bg-white text-black overflow-hidden shadow-2xl relative flex flex-col"
            style={{ aspectRatio: '3/4' }} // Standard mobile ratio for sharing
        >
            {/* Header / Branding */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                <div className="font-bold text-lg tracking-tight">闲置之家</div>
                <div className="text-xs opacity-80">邻里好物 放心交易</div>
            </div>

            {/* Main Image Area */}
            <div className="relative w-full h-[55%] bg-gray-100 flex items-center justify-center overflow-hidden">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <span className="text-4xl mb-2">📷</span>
                        <span className="text-sm">商品图片预览</span>
                    </div>
                )}

                {/* Price Tag Overlay */}
                {price && (
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg">
                        <span className="text-xs mr-1">¥</span>
                        <span className="text-xl font-bold">{price}</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col bg-white">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3 line-clamp-2">
                    {title || "商品名称"}
                </h1>

                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 flex-1">
                    {description || "这里显示商品描述..."}
                </p>

                {/* Footer / QR Placeholder */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            头像
                        </div>
                        <div className="text-xs text-gray-500">
                            <p>卖家发布</p>
                            <p>扫码联系我</p>
                        </div>
                    </div>
                    {/* Placeholder for user QR or mini-program code */}
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
