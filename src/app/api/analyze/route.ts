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

export async function POST(req: NextRequest) {
    try {
        const { image } = await req.json();

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
                phone: "13800138000"
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
          "title": "A concise, attractive title (in Chinese, e.g. '99新 iPhone 14 Pro')",
          "price": "A estimated price number in CNY (just the number, e.g. '4500')",
          "description": "A friendly, detailed description (in Chinese) mentioning condition, color, and likely accessories.",
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

            return NextResponse.json(data);

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
