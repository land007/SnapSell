import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';
import { AdData } from '@/components/AdSlot';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'ads.json');

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
    const isAdmin = searchParams.get('admin') === 'true';

    const action = searchParams.get('action');

    try {
        // Check if Vercel KV is configured
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            if (action === 'list_communities') {
                const keys = await kv.keys('snapsell_ads_*');
                const communities = keys.map(k => k.replace('snapsell_ads_', ''));
                return NextResponse.json(communities);
            }
            const ads = await kv.get<AdData[]>(`snapsell_ads_${community}`);
            return NextResponse.json(ads || []);
        } else {
            // Local Fallback
            const allData = await readLocalData();
            if (action === 'list_communities') {
                return NextResponse.json(Object.keys(allData));
            }
            return NextResponse.json(allData[community] || []);
        }
    } catch (error) {
        console.error('Storage Error:', error);
        return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { community = 'default', ads } = body;

        if (!Array.isArray(ads)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Check if Vercel KV is configured
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            await kv.set(`snapsell_ads_${community}`, ads);
        } else {
            // Local Fallback
            const allData = await readLocalData();
            allData[community] = ads;
            await writeLocalData(allData);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Storage Error:', error);
        return NextResponse.json({ error: 'Failed to save ads' }, { status: 500 });
    }
}
