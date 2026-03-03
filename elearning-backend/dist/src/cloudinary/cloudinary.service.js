"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = class CloudinaryService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
            secure: true,
        });
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        if (!cloudName || cloudName === 'your_cloud_name') {
            console.warn('[CloudinaryService] ⚠️ Cloudinary credentials not configured. Media features will use direct URLs.');
        }
        else {
            console.log(`[CloudinaryService] ✅ Configured for cloud: ${cloudName}`);
        }
    }
    isConfigured() {
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        return !!cloudName && cloudName !== 'your_cloud_name';
    }
    getStreamingUrl(publicIdOrUrl) {
        if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
            return publicIdOrUrl;
        }
        if (!this.isConfigured())
            return publicIdOrUrl;
        return cloudinary_1.v2.url(publicIdOrUrl, {
            resource_type: 'video',
            type: 'upload',
            secure: true,
            format: 'mp4',
        });
    }
    getSecureDocumentUrl(publicIdOrUrl) {
        if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
            return publicIdOrUrl;
        }
        if (!this.isConfigured())
            return publicIdOrUrl;
        return cloudinary_1.v2.url(publicIdOrUrl, {
            resource_type: 'raw',
            type: 'upload',
            secure: true,
        });
    }
    async uploadFile(filePath, options = {}) {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            resource_type: options.resourceType || 'auto',
            folder: options.folder || 'elearning',
            public_id: options.publicId,
            type: 'upload',
        });
        return {
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format,
            bytes: result.bytes,
        };
    }
    generateCertificateUrl(studentName, courseName, issueDate) {
        const templatePublicId = 'swt470ijgwmqhm6utf6h';
        const safeName = studentName.replace(/,/g, ' ').replace(/#/g, 'sharp');
        const safeCourse = courseName.replace(/,/g, ' ').replace(/#/g, 'sharp');
        const safeDate = issueDate.replace(/,/g, ' ');
        return cloudinary_1.v2.url(templatePublicId, {
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
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map