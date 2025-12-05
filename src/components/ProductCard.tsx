"use client";

import React, { forwardRef } from 'react';

interface ProductCardProps {
    data: {
        title: string;
        price: string;
        description: string;
        image: string | null;
    };
    communityName?: string;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ data, communityName }, ref) => {
    const { title, price, description, image } = data;

    return (
        <div
            ref={ref}
            className="w-[375px] bg-card text-card-foreground overflow-hidden shadow-2xl relative flex flex-col"
            style={{ aspectRatio: '3/4' }} // Standard mobile ratio for sharing
        >
            {/* Header / Branding */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                <div className="font-bold text-lg tracking-tight">
                    {communityName ? `SnapSell · ${communityName}` : 'SnapSell · 闲置之家'}
                </div>
                <div className="text-xs opacity-80">邻里好物 当面交易</div>
            </div>

            {/* Main Image Area */}
            <div className="relative w-full h-[55%] bg-muted flex items-center justify-center overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                            console.error('ProductCard image load error');
                            e.currentTarget.style.display = 'none';
                        }}
                    />
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
            <div className="p-5 flex-1 flex flex-col bg-card">
                <h1 className="text-2xl font-bold text-card-foreground leading-tight mb-3 line-clamp-2">
                    {title || "商品名称"}
                </h1>

                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-[8] flex-1">
                    {description || "这里显示商品描述..."}
                </p>
            </div>
        </div>

    );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
