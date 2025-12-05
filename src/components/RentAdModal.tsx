"use client";

import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { AdData } from './AdSlot';
import { AD_CONFIG } from '@/config/adConfig';
import { QRCodeSVG } from 'qrcode.react';

interface RentAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (ad: AdData) => void;
}

export default function RentAdModal({ isOpen, onClose, onPublish }: RentAdModalProps) {
    const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
    const [formData, setFormData] = useState({
        advertiser: '',
        offer: '',
        link: '',
        address: '',
        phone: '',
        image: null as string | null,
        hasRedeem: false, // Default to false
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    if (!isOpen) return null;

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

            setFormData(prev => ({
                ...prev,
                advertiser: data.title || prev.advertiser,
                offer: data.description ? data.description.slice(0, 30) + (data.description.length > 30 ? '...' : '') : prev.offer,
                address: data.address || prev.address,
                phone: data.phone || prev.phone,
            }));
        } catch (error) {
            console.error('AI Analysis error:', error);
            alert('AI 识别失败，请稍后重试');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({ ...prev, image: e.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitForm = () => {
        if (!formData.advertiser || !formData.offer) return;
        setStep('payment');
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setStep('success');

        // Auto publish after success
        setTimeout(() => {
            onPublish({
                isActive: true,
                advertiser: formData.advertiser,
                offer: formData.offer,
                qrContent: formData.link || 'https://example.com', // Use link as QR content
                contact: '',
                address: formData.address,
                phone: formData.phone,
                expiresAt: Date.now() + AD_CONFIG.DURATION_DAYS * 24 * 60 * 60 * 1000,
                image: formData.image || undefined,
                hasRedeem: formData.hasRedeem,
            });
        }, 1500);
    };

    const handleReset = () => {
        setFormData({
            advertiser: '',
            offer: '',
            link: '',
            address: '',
            phone: '',
            image: null,
            hasRedeem: false,
        });
        setStep('form');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        {step === 'success' ? '🎉 提交成功' : '📢 广告位招租'}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                        {step === 'form' && '填写广告信息，让更多人看到您的商品'}
                        {step === 'payment' && '联系管理员缴费，审核后上线'}
                        {step === 'success' && '您的广告已提交，等待管理员开通'}
                    </p>
                </div>

                <div className="p-6">
                    {step === 'form' && (
                        <div className="space-y-4">
                            {/* Image Upload Area */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">广告图片 (可选)</label>
                                <div className="relative">
                                    {formData.image ? (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 group">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>

                                            {/* AI Auto-Fill Button Overlay */}
                                            <div className="absolute bottom-2 right-2">
                                                <button
                                                    onClick={handleAIAnalyze}
                                                    disabled={isAnalyzing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-violet-700 disabled:opacity-70 transition-all"
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span>识别中...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>✨ AI 自动填写</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                <p className="text-xs text-gray-500">点击上传图片</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">广告主名称</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                    placeholder="例如：老张烧烤"
                                    value={formData.advertiser}
                                    onChange={e => setFormData({ ...formData, advertiser: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasRedeem}
                                        onChange={e => setFormData({ ...formData, hasRedeem: e.target.checked })}
                                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">提供到店核销优惠</span>
                                </label>

                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                    placeholder={formData.hasRedeem ? "例如：凭此截图到店送啤酒一瓶" : "例如：正宗东北烧烤，欢迎品尝"}
                                    value={formData.offer}
                                    onChange={e => setFormData({ ...formData, offer: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">跳转链接 (可选)</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                    placeholder="https://..."
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">地址 (可选)</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                        placeholder="店铺地址"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">电话 (可选)</label>
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                        placeholder="联系电话"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitForm}
                                disabled={!formData.advertiser || !formData.offer}
                                className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                下一步
                            </button>
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="space-y-6 text-center py-4">
                            <div className="space-y-2">
                                <p className="text-gray-500">需支付租金</p>
                                <p className="text-4xl font-bold text-gray-900">¥{AD_CONFIG.PRICE}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">广告主</span>
                                    <span className="font-medium">{formData.advertiser}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">展示时长</span>
                                    <span className="font-medium">{AD_CONFIG.DURATION_DAYS} 天</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 pt-1 border-t border-gray-100 mt-2">
                                    <span>有效期至</span>
                                    <span>{new Date(Date.now() + AD_CONFIG.DURATION_DAYS * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Admin Contact Info */}
                            <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 space-y-3">
                                <p className="text-violet-800 font-medium text-sm">请联系群主缴费开通</p>
                                <div className="flex justify-center">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <QRCodeSVG value="https://u.wechat.com/mock-admin-id" size={120} />
                                    </div>
                                </div>
                                <p className="text-xs text-violet-600">扫码添加群主微信 (ID: Admin888)</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            提交中...
                                        </>
                                    ) : (
                                        '已联系，提交审核'
                                    )}
                                </button>
                                <p className="text-xs text-gray-400">
                                    * 提交后请耐心等待，管理员确认收款后将立即开通
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="space-y-6 text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">提交成功！</h3>
                                <p className="text-gray-500">您的广告已提交，等待管理员开通</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    关闭
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
                                >
                                    继续投放
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
