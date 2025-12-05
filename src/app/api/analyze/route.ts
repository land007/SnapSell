import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleApiKey } from '@/utils/apiKey';
import Redis from 'ioredis';

// Define the response structure
interface AnalyzeResponse {
    title: string;
    price: string;
    description: string;
    tags: string[];
    address?: string;
    phone?: string;
}

// Initialize Redis client
let redis: Redis | null = null;
if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
}

// In-memory fallback if Redis is not available
const MEMORY_RATE_LIMIT = new Map<string, { tokens: number; lastRefill: number }>();

const MAX_TOKENS = 3;
const REFILL_INTERVAL = 60 * 60 * 1000; // 1 hour

// Helper function to get rate limit data
async function getRateLimit(visitorId: string): Promise<{ tokens: number; lastRefill: number }> {
    if (redis) {
        const key = `ratelimit:${visitorId}`;
        const data = await redis.get(key);
        if (data) {
            return JSON.parse(data);
        }
        // Initialize new user
        const newLimit = { tokens: MAX_TOKENS, lastRefill: Date.now() };
        await redis.set(key, JSON.stringify(newLimit), 'EX', 7 * 24 * 60 * 60); // 7 days expiry
        return newLimit;
    } else {
        // Fallback to memory
        let limit = MEMORY_RATE_LIMIT.get(visitorId);
        if (!limit) {
            limit = { tokens: MAX_TOKENS, lastRefill: Date.now() };
            MEMORY_RATE_LIMIT.set(visitorId, limit);
        }
        return limit;
    }
}

// Helper function to save rate limit data
async function saveRateLimit(visitorId: string, data: { tokens: number; lastRefill: number }): Promise<void> {
    if (redis) {
        const key = `ratelimit:${visitorId}`;
        await redis.set(key, JSON.stringify(data), 'EX', 7 * 24 * 60 * 60); // 7 days expiry
    } else {
        MEMORY_RATE_LIMIT.set(visitorId, data);
    }
}

// Helper function to check and consume token
async function checkAndConsumeToken(visitorId: string): Promise<{ allowed: boolean; remainingTokens: number; errorMessage?: string }> {
    const now = Date.now();
    const userLimit = await getRateLimit(visitorId);

    // Calculate refill
    const timePassed = now - userLimit.lastRefill;
    const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL);

    if (tokensToAdd > 0) {
        userLimit.tokens = Math.min(MAX_TOKENS, userLimit.tokens + tokensToAdd);
        userLimit.lastRefill = now;
    }

    // Check if tokens available
    if (userLimit.tokens <= 0) {
        const timeToNextRefill = REFILL_INTERVAL - (now - userLimit.lastRefill);
        const minutes = Math.ceil(timeToNextRefill / 60000);
        return {
            allowed: false,
            remainingTokens: 0,
            errorMessage: `今日次数已用完，请休息一下再来 (剩余恢复时间 ${minutes} 分钟)`
        };
    }

    // Consume token
    userLimit.tokens--;
    await saveRateLimit(visitorId, userLimit);

    return {
        allowed: true,
        remainingTokens: userLimit.tokens
    };
}

export async function POST(req: NextRequest) {
    try {
        const { image, visitorId } = await req.json();

        // 1. Rate Limiting Logic
        let remainingTokens: number | undefined;
        if (visitorId) {
            const { allowed, remainingTokens: newRemainingTokens, errorMessage } = await checkAndConsumeToken(visitorId);
            remainingTokens = newRemainingTokens;
            if (!allowed) {
                return NextResponse.json(
                    { error: errorMessage },
                    { status: 429 }
                );
            }
        } else {
            console.warn('[RateLimit] No visitorId provided!');
        }

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        const apiKey = getGoogleApiKey();

        // MOCK MODE: Fallback if no key
        if (!apiKey || apiKey === 'mock') {
            console.log('Using Mock AI Mode');
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                title: "【转手】99新 苹果 iPhone 14 Pro 暗紫色",
                price: "5200",
                description: "自用一手，国行正品。电池健康 95%，一直贴膜带壳使用，无划痕无磕碰。原盒配件齐全，因换新机闲置转让。优先面交，爽快包邮。",
                tags: ["99新", "电池耐用", "箱说全", "个人自用"],
                address: "北京市海淀区中关村大街1号",
                phone: "13800138000",
                remainingTokens: remainingTokens
            });
        }

        // REAL MODE: Google Gemini
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    temperature: 0.7,
                }
            });

            // Remove header from base64 string (data:image/jpeg;base64,...)
            const base64Data = image.split(',')[1];

            const prompt = `
        You are an expert second-hand marketplace assistant. 
        Analyze this image and generate a JSON response for a listing.
        
        Output format (JSON only):
        {
          "title": "A concise, attractive title (in Chinese, e.g. '99新 iPhone 14 Pro', max 60 characters)",
          "price": "A estimated price number in CNY (just the number, e.g. '4500')",
          "description": "A friendly, detailed description (in Chinese, max 240 characters) mentioning condition, color, and key features.",
          "tags": ["tag1", "tag2", "tag3", "tag4"],
          "address": "Extract address from image if visible, otherwise null",
          "phone": "Extract phone number from image if visible, otherwise null"
        }
      `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg", // Assuming JPEG for simplicity, or detect from header
                    },
                },
            ]);

            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if present
            const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
            const data = JSON.parse(jsonStr);

            return NextResponse.json({
                ...data,
                remainingTokens: remainingTokens
            });

        } catch (aiError) {
            console.error('Gemini API Error:', aiError);
            return NextResponse.json(
                { error: 'AI Analysis Failed' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
        return NextResponse.json({ tokens: MAX_TOKENS });
    }

    try {
        const now = Date.now();
        const userLimit = await getRateLimit(visitorId);

        // Calculate refill
        const timePassed = now - userLimit.lastRefill;
        const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL);

        let currentTokens = userLimit.tokens;
        if (tokensToAdd > 0) {
            currentTokens = Math.min(MAX_TOKENS, userLimit.tokens + tokensToAdd);
        }

        return NextResponse.json({ tokens: currentTokens });
    } catch (error) {
        console.error('GET rate limit error:', error);
        return NextResponse.json({ tokens: MAX_TOKENS });
    }
}
