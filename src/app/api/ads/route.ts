import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import Redis from 'ioredis';
import fs from 'fs/promises';
import path from 'path';
import { AdData } from '@/components/AdSlot';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'ads.json');

// Initialize Redis client if URL is provided
let redis: Redis | null = null;
if (process.env.REDIS_URL) {
    console.log('[API] Initializing Redis client with REDIS_URL');
    redis = new Redis(process.env.REDIS_URL);
}

// In-memory fallback for Vercel (when KV is not set up)
// Note: Data will be lost when the serverless function restarts!
let globalMemoryAds: Record<string, AdData[]> = {};

// Helper to ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Helper to read local data
async function readLocalData(): Promise<Record<string, AdData[]>> {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Helper to write local data
async function writeLocalData(data: Record<string, AdData[]>) {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const community = searchParams.get('community') || 'default';
    const action = searchParams.get('action');

    try {
        // 1. Check for Generic Redis (REDIS_URL)
        if (redis) {
            if (action === 'list_communities') {
                const keys = await redis.keys('snapsell_ads_*');
                const communities = keys.map((k: string) => k.replace('snapsell_ads_', ''));
                return NextResponse.json(communities);
            }
            const data = await redis.get(`snapsell_ads_${community}`);
            const ads = data ? JSON.parse(data) : [];
            return NextResponse.json(ads);
        }
        // 2. Check for Vercel KV
        else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            if (action === 'list_communities') {
                const keys = await kv.keys('snapsell_ads_*');
                const communities = keys.map(k => k.replace('snapsell_ads_', ''));
                return NextResponse.json(communities);
            }
            const ads = await kv.get<AdData[]>(`snapsell_ads_${community}`);
            return NextResponse.json(ads || []);
        }
        // 3. Local Fallback (Dev only, and NOT on Vercel)
        else if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
            const allData = await readLocalData();
            if (action === 'list_communities') {
                return NextResponse.json(Object.keys(allData));
            }
            return NextResponse.json(allData[community] || []);
        }
        // 4. In-Memory Fallback
        else {
            if (action === 'list_communities') {
                return NextResponse.json(Object.keys(globalMemoryAds));
            }
            return NextResponse.json(globalMemoryAds[community] || []);
        }
    } catch (error) {
        console.error('[API] Storage Error:', error);
        return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log('[API] Received POST request');
        const body = await req.json();
        const { community = 'default', ads } = body;
        console.log(`[API] Saving ads for community: ${community}, count: ${ads?.length}`);

        if (!Array.isArray(ads)) {
            console.error('[API] Invalid data format: ads is not an array');
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // 1. Generic Redis
        if (redis) {
            console.log('[API] Using Generic Redis');
            await redis.set(`snapsell_ads_${community}`, JSON.stringify(ads));
        }
        // 2. Vercel KV
        else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            console.log('[API] Using Vercel KV');
            await kv.set(`snapsell_ads_${community}`, ads);
        }
        // 3. Local Fallback
        else if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
            console.log('[API] Using Local File System');
            try {
                const allData = await readLocalData();
                allData[community] = ads;
                await writeLocalData(allData);
            } catch (err) {
                console.error('[API] Local write failed, falling back to memory:', err);
                globalMemoryAds[community] = ads;
            }
        }
        // 4. In-Memory Fallback
        else {
            console.log('[API] Using In-Memory Fallback');
            globalMemoryAds[community] = ads;
        }

        console.log('[API] Save successful');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Storage Error:', error);
        return NextResponse.json({ error: 'Failed to save ads' }, { status: 500 });
    }
}
