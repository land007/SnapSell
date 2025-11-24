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

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        // 检查文件大小（限制 10MB）
        if (file.size > 10 * 1024 * 1024) {
            alert('图片文件过大，请选择小于 10MB 的图片');
            return;
        }

        try {
            // 使用 Canvas 压缩和转换图片
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (event) => {
                if (!event.target?.result) return;

                img.onload = () => {
                    // 创建 canvas 进行压缩
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    // 计算缩放比例（最大宽度 1200px）
                    const maxWidth = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // 绘制图片
                    ctx.drawImage(img, 0, 0, width, height);

                    // 转换为 base64（JPEG 格式，质量 0.8）
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

                    const newData = { ...formData, image: compressedDataUrl };
                    setFormData(newData);
                    onUpdate(newData);
                };

                img.onerror = () => {
                    alert('图片加载失败，请重试');
                };

                img.src = event.target.result as string;
            };

            reader.onerror = () => {
                alert('图片读取失败，请重试');
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Image upload error:', error);
            alert('图片上传失败，请重试');
        }
    };

    const removeImage = () => {
        const newData = { ...formData, image: null };
        setFormData(newData);
        onUpdate(newData);
        // 重置 file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
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
                                <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG、HEIC 等格式</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*,image/heic,image/heif"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
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
