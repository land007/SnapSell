import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client for Cloudflare R2
let s3Client: S3Client | null = null;

if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
    console.log('[Upload] Cloudflare R2 client initialized');
} else {
    console.warn('[Upload] R2 credentials not configured, uploads will fail');
}

export async function POST(req: NextRequest) {
    try {
        // Check if R2 is configured
        if (!s3Client || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
            return NextResponse.json(
                { error: 'Image storage not configured' },
                { status: 500 }
            );
        }

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `ads/${timestamp}-${randomStr}.${ext}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(command);

        // Construct public URL
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;

        console.log('[Upload] Image uploaded:', publicUrl);

        return NextResponse.json({
            success: true,
            url: publicUrl,
        });

    } catch (error) {
        console.error('[Upload] Error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
