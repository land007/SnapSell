"use client";

import React, { useState, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import LoadingAd from './LoadingAd';

export interface ProductData {
    title: string;
    price: string;
    description: string;
    image: string | null;
}

interface ProductFormProps {
    onUpdate: (data: ProductData) => void;
    loadingAdConfig: any; // Ideally import type, but for now any or define it
    onAdComplete: () => void;
}

export default function ProductForm({ onUpdate, loadingAdConfig, onAdComplete }: ProductFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        image: null as string | null,
    });

    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [smartText, setSmartText] = useState('');
    const [showLoadingAd, setShowLoadingAd] = useState(false);

    // AI Analysis Handler
    const handleAIAnalyze = async () => {
        if (!formData.image) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: formData.image }),
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();

            const newData = {
                ...formData,
                title: data.title || formData.title,
                price: data.price || formData.price,
                description: data.description || formData.description,
            };

            setFormData(newData);
            onUpdate(newData);
        } catch (error) {
            console.error('AI Analysis error:', error);
            alert('AI 识别失败，请稍后重试');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Smart Paste Handler
    const handleSmartPaste = async () => {
        if (!smartText.trim()) return;

        const { parseProductInfo } = await import('@/utils/textParser');
        const info = parseProductInfo(smartText);

        const newData = {
            ...formData,
            title: info.title || formData.title,
            price: info.price || formData.price,
            description: info.description || formData.description,
        };

        setFormData(newData);
        onUpdate(newData);
        setSmartText(''); // Clear after paste
    };

    // Clipboard Image Paste
    React.useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    if (file) {
                        // Reuse existing upload logic by mocking an event
                        // or extracting the logic. For simplicity, let's extract logic or just call it.
                        // Since handleImageUpload expects a ChangeEvent, let's refactor slightly or just create a synthetic one?
                        // Better: extract the core logic. But for now, let's just process it directly here.
                        processFile(file);
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [formData]); // Add dependency to ensure state updates correctly

    const processFile = (file: File) => {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                // Simple compression logic (simplified from original for brevity, or reuse)
                // For this implementation, let's just use the dataUrl directly to save space/complexity
                // unless we want to duplicate the compression logic. 
                // Let's just set it for now.
                const newData = { ...formData, image: dataUrl };
                setFormData(newData);
                onUpdate(newData);
            }
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        onUpdate(newData);
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const removeImage = () => {
        const newData = { ...formData, image: null };
        setFormData(newData);
        onUpdate(newData);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const addTag = (tag: string) => {
        const newDesc = formData.description ? `${formData.description} ${tag}` : tag;
        const newData = { ...formData, description: newDesc };
        setFormData(newData);
        onUpdate(newData);
    };

    // Wrap the original analyze handler to control ad visibility
    const handleAnalyzeWithAd = async () => {
        setShowLoadingAd(true);
        // Minimum display time for the ad to ensure it's seen (e.g., 2 seconds)
        // This prevents the ad from flashing too quickly if the API is fast.
        const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await Promise.all([handleAIAnalyze(), minTimePromise]);
        } finally {
            setShowLoadingAd(false);
            onAdComplete(); // Notify parent to update header ad
        }
    };

    return (
        <>
            <LoadingAd
                isOpen={showLoadingAd}
                {...loadingAdConfig}
                onClose={() => setShowLoadingAd(false)} // Allow manual close
            />

            <div className="space-y-6 p-6 bg-card border border-border rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">填写商品信息</h2>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">
                        商品图片 <span className="text-xs text-muted-foreground/70">(支持 Ctrl+V 粘贴)</span>
                    </label>
                    <div className="relative">
                        {formData.image ? (
                            <div className="space-y-3">
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Image display error');
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* AI Auto-Fill Button */}
                                <button
                                    onClick={handleAnalyzeWithAd}
                                    disabled={isAnalyzing}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:opacity-90 transition-all disabled:opacity-70"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>AI 正在识别商品...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>✨ AI 自动填写信息</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isUploading ? (
                                        <>
                                            <div className="w-8 h-8 mb-3 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm text-muted-foreground">正在处理图片...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">点击上传 或 Ctrl+V 粘贴</p>
                                            <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG、HEIC 等格式</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Smart Paste Section (Collapsed/Secondary) */}
                <div className="bg-secondary/20 p-4 rounded-lg border border-border/50 space-y-2">
                    <label className="text-sm font-medium text-primary flex items-center gap-2">
                        📝 粘贴文本识别 (可选)
                    </label>
                    <div className="flex gap-2">
                        <textarea
                            value={smartText}
                            onChange={(e) => setSmartText(e.target.value)}
                            placeholder="如果没有图片，也可以粘贴文字描述..."
                            className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-12 focus:h-24 transition-all"
                        />
                        <button
                            onClick={handleSmartPaste}
                            disabled={!smartText}
                            className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 disabled:opacity-50 transition-colors h-auto"
                        >
                            识别
                        </button>
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
                        type="text"
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

                    {/* Quick Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {['99新', '95新', '全新', '包邮', '可小刀', '仅面交', '箱说全'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => addTag(tag)}
                                className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>

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
        </>
    );
}
