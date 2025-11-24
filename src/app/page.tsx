"use client";

import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import ProductForm, { ProductData } from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import AdSlot from '@/components/AdSlot';

export default function Home() {
  const [productData, setProductData] = useState<ProductData>({
    title: '',
    price: '',
    description: '',
    image: null,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleUpdate = (data: ProductData) => {
    setProductData(data);
  };

  const handleGenerate = async () => {
    if (cardRef.current === null) {
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      setGeneratedImage(dataUrl);
      setShowImageModal(true);
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('生成图片失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `snapsell-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <h1 className="font-bold text-xl tracking-tight">SnapSell</h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            社区闲置好物生成器
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form & Ad (Desktop: 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AdSlot />
            <ProductForm onUpdate={handleUpdate} />
          </div>

          {/* Right Column: Preview & Actions (Desktop: 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">实时预览</h2>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  375 x 500 px
                </span>
              </div>

              {/* Preview Container - Centered */}
              <div className="flex justify-center bg-secondary/30 p-4 rounded-2xl border border-border/50">
                <div className="shadow-2xl rounded-none overflow-hidden transform transition-transform hover:scale-[1.02] duration-300">
                  <ProductCard ref={cardRef} data={productData} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="col-span-2 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                >
                  {isGenerating ? (
                    <span>生成中...</span>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>生成分享图片</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                💡 提示：生成后长按图片可直接分享到微信
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Image Preview Modal for WeChat Sharing */}
      {showImageModal && generatedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-md w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <img
                src={generatedImage}
                alt="Generated Product"
                className="w-full h-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Instructions */}
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-4 text-white space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold">微信内分享</p>
                  <p className="text-sm text-gray-300">长按图片 → 选择"发送给朋友"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold">保存到相册</p>
                  <p className="text-sm text-gray-300">长按图片 → 选择"保存图片"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold">电脑端下载</p>
                  <button
                    onClick={handleDownload}
                    className="text-sm text-blue-300 hover:text-blue-200 underline"
                  >
                    点击下载到本地
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 SnapSell 闲置之家. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
