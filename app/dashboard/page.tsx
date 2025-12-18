"use client";

import { useState } from "react";
import { Wallet, Link as LinkIcon, Copy, ArrowRight, Zap } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { APP_CONFIG } from "@/lib/app-config";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();

    const [createdLinks, setCreatedLinks] = useState<any[]>([]);
    const [formData, setFormData] = useState({ title: "", price: APP_CONFIG.DEFAULT_PRICE, description: "" });
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const res = await fetch("/api/paywall/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    creatorAddress: address,
                    ...formData,
                    price: APP_CONFIG.DEFAULT_PRICE
                })
            });
            const data = await res.json();
            if (data.success) {
                setCreatedLinks([data.data, ...createdLinks]);
                setFormData({ title: "", price: APP_CONFIG.DEFAULT_PRICE, description: "" });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Connect Wallet</h1>
                        <p className="text-gray-500 mt-2">Please connect your wallet to access your creator dashboard.</p>
                    </div>
                    <div className="flex justify-center">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        <Zap size={18} />
                    </div>
                    <span className="font-bold text-xl tracking-tight">x402 Gateway</span>
                </div>
                <ConnectButton showBalance={false} accountStatus="address" />
            </header>

            <main className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Create Form */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create New Link</h2>
                            <p className="text-gray-500">Set your price and start sharing.</p>
                        </div>
                        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="Priority DM" 
                                    value={formData.title} 
                                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Fixed for Demo)</label>
                                <input
                                    disabled
                                    type="number"
                                    value={formData.price}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isCreating} 
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? "Creating..." : "Generate Link"} <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Links List */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Your Links</h2>
                            <p className="text-gray-500">Share these links to receive paid messages.</p>
                        </div>
                        <div className="space-y-4">
                            {createdLinks.map(link => (
                                <div key={link.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{link.title}</h3>
                                            <p className="text-sm text-gray-500">{link.price} {link.currency}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <LinkIcon size={14} className="text-gray-400" />
                                        <span className="text-sm font-mono text-gray-600 truncate flex-1 block">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/c/${link.id}` : `/c/${link.id}`}
                                        </span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/c/${link.id}`);
                                                alert("Copied to clipboard!");
                                            }}
                                            className="text-gray-400 hover:text-black transition-colors p-1 hover:bg-gray-200 rounded"
                                            title="Copy link"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {createdLinks.length === 0 && (
                                <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                                    <LinkIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-400">No links yet. Create your first one!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
