"use client";

import React, { useState, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

export interface ProductData {
    title: string;
    price: string;
    description: string;
    image: string | null;
}

interface ProductFormProps {
    onUpdate: (data: ProductData) => void;
}

export default function ProductForm({ onUpdate }: ProductFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        image: null as string | null,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        onUpdate(newData);
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const newData = { ...formData, image: result };
                setFormData(newData);
                onUpdate(newData);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        const newData = { ...formData, image: null };
        setFormData(newData);
        onUpdate(newData);
    };

    return (
        <div className="space-y-6 p-6 bg-card border border-border rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">填写商品信息</h2>

            {/* Image Upload */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">商品图片</label>
                <div className="relative">
                    {formData.image ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">点击上传图片</p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">商品名称</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="例如：99新 iPhone 14 Pro"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>

            {/* Price */}
            <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-muted-foreground">价格 (元)</label>
                <input
                    type="text" // Keep as text to allow flexible input like "100包邮" if needed, or restrict to number
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="例如：4500"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground">商品描述</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="描述一下商品的成色、入手渠道、转手原因等..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
            </div>
        </div>
    );
}
