import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleApiKey } from '@/utils/apiKey';

// Define the response structure
interface AnalyzeResponse {
    title: string;
    price: string;
    description: string;
    tags: string[];
    address?: string;
    phone?: string;
}

// Simple in-memory rate limiter (Note: resets on server restart)
const RATE_LIMIT_MAP = new Map<string, { tokens: number; lastRefill: number }>();
const MAX_TOKENS = 3;
const REFILL_INTERVAL = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
    try {
        const { image, visitorId } = await req.json();

        // 1. Rate Limiting Logic
        if (visitorId) {
            const now = Date.now();
            let userLimit = RATE_LIMIT_MAP.get(visitorId);

            if (!userLimit) {
                userLimit = { tokens: MAX_TOKENS, lastRefill: now };
                RATE_LIMIT_MAP.set(visitorId, userLimit);
            }

            // Calculate refill
            const timePassed = now - userLimit.lastRefill;
            const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL);

            if (tokensToAdd > 0) {
                userLimit.tokens = Math.min(MAX_TOKENS, userLimit.tokens + tokensToAdd);
                userLimit.lastRefill = now;
                // console.log(`[RateLimit] Refilled ${tokensToAdd} tokens for ${visitorId}. Current: ${userLimit.tokens}`);
            }

            if (userLimit.tokens <= 0) {
                const timeToNextRefill = REFILL_INTERVAL - (now - userLimit.lastRefill);
                const minutes = Math.ceil(timeToNextRefill / 60000);
                return NextResponse.json(
                    { error: `今日次数已用完，请休息一下再来 (剩余恢复时间 ${minutes} 分钟)` },
                    { status: 429 }
                );
            }

            // Deduct token
            userLimit.tokens--;
            RATE_LIMIT_MAP.set(visitorId, userLimit);
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
                remainingTokens: visitorId ? RATE_LIMIT_MAP.get(visitorId)?.tokens : undefined
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
          "title": "A concise, attractive title (in Chinese, e.g. '99新 iPhone 14 Pro', max 20 characters)",
          "price": "A estimated price number in CNY (just the number, e.g. '4500')",
          "description": "A friendly, concise description (in Chinese, max 80 characters) mentioning condition and key features.",
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
                remainingTokens: visitorId ? RATE_LIMIT_MAP.get(visitorId)?.tokens : undefined
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

    const now = Date.now();
    let userLimit = RATE_LIMIT_MAP.get(visitorId);

    if (!userLimit) {
        return NextResponse.json({ tokens: MAX_TOKENS });
    }

    // Calculate refill (read-only, don't update state on GET to avoid side effects, or update if needed)
    // For display accuracy, we should calculate what the tokens WOULD be.
    const timePassed = now - userLimit.lastRefill;
    const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL);
    const currentTokens = Math.min(MAX_TOKENS, userLimit.tokens + tokensToAdd);

    return NextResponse.json({ tokens: currentTokens });
}
