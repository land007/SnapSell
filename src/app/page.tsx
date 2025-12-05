"use client";

import React, { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import ProductForm, { ProductData } from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import { AdData } from '@/components/AdSlot';
import AdCarousel from '@/components/AdCarousel';
import ThemeToggle from '@/components/ThemeToggle';

// Mock Data
const DEFAULT_AD: AdData = {
  isActive: false,
  advertiser: "老王水果店",
  offer: "凭此码到店享 8.8 折优惠",
  qrContent: "COUPON:FRUIT_88_OFF",
  contact: "联系管理员投放广告: 138-xxxx-xxxx"
};

const NIKE_AD_CONFIG = {
  type: 'image' as const,
  src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop',
  link: 'https://example.com',
  advertiser: '耐克官方旗舰店',
  description: '极致舒适，动感十足。限时特惠，点击查看详情。'
};

const NIKE_AD_HEADER: AdData = {
  isActive: true,
  advertiser: '耐克官方旗舰店',
  offer: '极致舒适，动感十足。限时特惠，点击查看详情。',
  qrContent: 'https://example.com',
  contact: ''
};

function HomeContent() {
  const searchParams = useSearchParams();
  const communityName = searchParams.get('name');

  const [productData, setProductData] = useState<ProductData>({
    title: '',
    price: '',
    description: '',
    image: null,
  });

  const [headerAd, setHeaderAd] = useState<AdData>(DEFAULT_AD);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleUpdate = (data: ProductData) => {
    setProductData(data);
  };

  const handleAdComplete = () => {
    setHeaderAd(NIKE_AD_HEADER);
  };

  const handleGenerate = async () => {
    if (cardRef.current === null) {
      return;
    }

    setIsGenerating(true);
    let cleanupImages: (() => void) | null = null;

    try {
      console.log('Starting image generation...');

      // 1. Preload images to handle CORS
      // This fetches images as blobs and creates local object URLs
      const { preloadImages, isIOS } = await import('@/utils/imageUtils');
      cleanupImages = await preloadImages(cardRef.current);

      // 2. Determine settings based on device
      const iOS = isIOS();
      const isMobile = iOS || window.innerWidth < 768;
      const pixelRatio = isMobile ? 2 : 3; // Reduce ratio on mobile to save memory

      // 3. Generate image
      // Safari needs a moment to render the new blob URLs
      await new Promise(resolve => setTimeout(resolve, iOS ? 300 : 100));

      const options = {
        cacheBust: true,
        pixelRatio: pixelRatio,
        skipFonts: false,
        includeQueryParams: false,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
        }
      };

      // iOS Safari Fix: Double render
      // The first render often fails to paint the images (gray background).
      // We run a "warm-up" render to force the browser to paint.
      if (iOS) {
        console.log('Performing warm-up render for iOS...');
        try {
          await toPng(cardRef.current, options);
          await new Promise(resolve => setTimeout(resolve, 300)); // Wait for paint
        } catch (e) {
          console.warn('Warm-up render failed, continuing...', e);
        }
      }

      const dataUrl = await toPng(cardRef.current, options);

      console.log('Image generated successfully');
      setGeneratedImage(dataUrl);
      setShowImageModal(true);
    } catch (err) {
      console.error('Failed to generate image:', err);
      alert('生成图片失败，请重试\n\n提示：如果问题持续，请尝试重新上传图片');
    } finally {
      if (cleanupImages) {
        cleanupImages();
      }
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
            <h1 className="font-bold text-xl tracking-tight">
              SnapSell {communityName && <span className="text-violet-600">· {communityName}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              社区闲置好物生成器
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form & Ad (Desktop: 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AdCarousel
              initialAd={headerAd.isActive ? headerAd : undefined}
              communityName={communityName || undefined}
            />
            <ProductForm
              onUpdate={handleUpdate}
              loadingAdConfig={NIKE_AD_CONFIG}
              onAdComplete={handleAdComplete}
            />
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
