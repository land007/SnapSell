"use client";

import React, { useState, useEffect } from 'react';
import { useAdStore } from '@/hooks/useAdStore';
import { AdData } from '@/components/AdSlot';
import { Trash2, Edit, Check, X, Eye, Plus, LogOut } from 'lucide-react';
import RentAdModal from '@/components/RentAdModal';

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');

    // Community Management
    const [communities, setCommunities] = useState<string[]>(['default']);
    const [selectedCommunity, setSelectedCommunity] = useState('default');
    const [newCommunityName, setNewCommunityName] = useState('');

    // Ad Management
    const { ads, addAd, removeAd, updateAd } = useAdStore(selectedCommunity);
    const [isRentModalOpen, setIsRentModalOpen] = useState(false);

    // Scan for communities on mount
    useEffect(() => {
        const scanCommunities = () => {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('snapsell_ads_')) {
                    const community = key.replace('snapsell_ads_', '');
                    if (community) keys.push(community);
                }
            }
            if (keys.length > 0) {
                // Deduplicate and set
                setCommunities(Array.from(new Set(['default', ...keys])));
            }
        };

        if (isLoggedIn) {
            scanCommunities();
        }
    }, [isLoggedIn]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin888') {
            setIsLoggedIn(true);
        } else {
            alert('密码错误');
        }
    };

    const handleAddCommunity = () => {
        if (newCommunityName && !communities.includes(newCommunityName)) {
            setCommunities([...communities, newCommunityName]);
            setSelectedCommunity(newCommunityName);
            setNewCommunityName('');
        }
    };

    const toggleAdStatus = (index: number, ad: AdData) => {
        updateAd(index, { ...ad, isActive: !ad.isActive });
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">SnapSell 管理后台</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">管理员密码</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                placeholder="请输入密码"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors"
                        >
                            登录
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <h1 className="font-bold text-xl text-gray-800">SnapSell Admin</h1>
                </div>
                <button
                    onClick={() => setIsLoggedIn(false)}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                    <LogOut size={18} />
                    <span>退出</span>
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Community Selector */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">当前管理小区</h2>
                        <div className="flex gap-2">
                            <select
                                value={selectedCommunity}
                                onChange={(e) => setSelectedCommunity(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                            >
                                {communities.map(c => (
                                    <option key={c} value={c}>{c === 'default' ? '默认小区 (default)' : c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Add Community */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">新增小区</h2>
                        <div className="flex gap-2">
                            <input
                                value={newCommunityName}
                                onChange={(e) => setNewCommunityName(e.target.value)}
                                placeholder="输入小区名称"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                            <button
                                onClick={handleAddCommunity}
                                disabled={!newCommunityName}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ad List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">广告列表 ({ads.length})</h2>
                        <button
                            onClick={() => setIsRentModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                        >
                            <Plus size={18} />
                            <span>新增广告</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">广告图</th>
                                    <th className="px-6 py-4 font-medium">广告主 & 文案</th>
                                    <th className="px-6 py-4 font-medium">状态</th>
                                    <th className="px-6 py-4 font-medium">有效期</th>
                                    <th className="px-6 py-4 font-medium text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            暂无广告数据
                                        </td>
                                    </tr>
                                ) : (
                                    ads.map((ad, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                                                    {ad.image ? (
                                                        <img src={ad.image} alt={ad.advertiser} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{ad.advertiser}</div>
                                                <div className="text-sm text-gray-500 line-clamp-1">{ad.offer}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleAdStatus(index, ad)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${ad.isActive
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                        }`}
                                                >
                                                    {ad.isActive ? <Check size={12} /> : <X size={12} />}
                                                    {ad.isActive ? '已上架' : '待审核/下架'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {ad.expiresAt ? new Date(ad.expiresAt).toLocaleDateString() : '永久'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('确定要删除这条广告吗？')) {
                                                                removeAd(index);
                                                            }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="删除"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Reuse RentAdModal for creating new ads */}
            <RentAdModal
                isOpen={isRentModalOpen}
                onClose={() => setIsRentModalOpen(false)}
                onPublish={(newAd) => {
                    addAd(newAd);
                    setIsRentModalOpen(false);
                }}
            />
        </div>
    );
}
