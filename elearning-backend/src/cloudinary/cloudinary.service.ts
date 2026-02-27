import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
            secure: true,
        });

        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        if (!cloudName || cloudName === 'your_cloud_name') {
            console.warn('[CloudinaryService] ⚠️ Cloudinary credentials not configured. Media features will use direct URLs.');
        } else {
            console.log(`[CloudinaryService] ✅ Configured for cloud: ${cloudName}`);
        }
    }

    /**
     * Check if Cloudinary is properly configured
     */
    isConfigured(): boolean {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        return !!cloudName && cloudName !== 'your_cloud_name';
    }

    /**
     * Get a public URL for a video resource.
     * Security is handled at application level (enrollment check in resolver),
     * NOT at Cloudinary level. This simplifies delivery and avoids signature issues.
     */
    getStreamingUrl(publicIdOrUrl: string): string {
        // Full URL — return directly (works for Cloudinary upload URLs, YouTube, etc.)
        if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
            return publicIdOrUrl;
        }

        // If it's a publicId, generate a public URL
        if (!this.isConfigured()) return publicIdOrUrl;

        return cloudinary.url(publicIdOrUrl, {
            resource_type: 'video',
            type: 'upload',
            secure: true,
            format: 'mp4',
        });
    }

    /**
     * Get a public URL for a document/file resource.
     */
    getSecureDocumentUrl(publicIdOrUrl: string): string {
        // Full URL — return directly
        if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
            return publicIdOrUrl;
        }

        if (!this.isConfigured()) return publicIdOrUrl;

        return cloudinary.url(publicIdOrUrl, {
            resource_type: 'raw',
            type: 'upload',
            secure: true,
        });
    }

    /**
     * Upload a file to Cloudinary (for instructor uploads).
     * Uses 'upload' delivery type for public access.
     * Security is enforced at the application level, not Cloudinary level.
     */
    async uploadFile(
        filePath: string,
        options: {
            folder?: string;
            resourceType?: 'video' | 'image' | 'raw' | 'auto';
            publicId?: string;
        } = {},
    ): Promise<{ publicId: string; secureUrl: string; format: string; bytes: number }> {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: options.resourceType || 'auto',
            folder: options.folder || 'elearning',
            public_id: options.publicId,
            type: 'upload', // Public delivery — security handled at app level
        });

        return {
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format,
            bytes: result.bytes,
        };
    }

    /**
     * Generate a Dynamic Certificate URL using Text Overlay.
     * NOTE: Do NOT manually encodeURIComponent — Cloudinary SDK handles encoding.
     */
    generateCertificateUrl(studentName: string, courseName: string, issueDate: string): string {
        const templatePublicId = 'swt470ijgwmqhm6utf6h';

        // Sanitize text for Cloudinary text overlay:
        // - Replace commas with spaces (commas break Cloudinary text overlay syntax)
        // - Replace # with sharp (# breaks URL)
        const safeName = studentName.replace(/,/g, ' ').replace(/#/g, 'sharp');
        const safeCourse = courseName.replace(/,/g, ' ').replace(/#/g, 'sharp');
        const safeDate = issueDate.replace(/,/g, ' ');

        return cloudinary.url(templatePublicId, {
            secure: true,
            transformation: [
                { overlay: { font_family: 'Arial', font_size: 60, font_weight: 'bold', text: safeName } },
                { flags: 'layer_apply', gravity: 'center', y: -60 },
                { overlay: { font_family: 'Arial', font_size: 40, text: safeCourse } },
                { flags: 'layer_apply', gravity: 'center', y: 40 },
                { overlay: { font_family: 'Arial', font_size: 25, text: safeDate } },
                { flags: 'layer_apply', gravity: 'center', y: 130 }
            ]
        });
    }
}
