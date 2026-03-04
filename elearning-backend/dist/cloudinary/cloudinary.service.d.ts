import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService implements OnModuleInit {
    private readonly configService;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    isConfigured(): boolean;
    getStreamingUrl(publicIdOrUrl: string): string;
    getSecureDocumentUrl(publicIdOrUrl: string): string;
    uploadFile(filePath: string, options?: {
        folder?: string;
        resourceType?: 'video' | 'image' | 'raw' | 'auto';
        publicId?: string;
    }): Promise<{
        publicId: string;
        secureUrl: string;
        format: string;
        bytes: number;
    }>;
    generateCertificateUrl(studentName: string, courseName: string, issueDate: string): string;
}
