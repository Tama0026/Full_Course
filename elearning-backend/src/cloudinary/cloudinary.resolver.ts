import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CloudinarySignature } from './dto/cloudinary-signature.type';

@Resolver(() => CloudinarySignature)
export class CloudinaryResolver {
    @Query(() => CloudinarySignature, { name: 'uploadSignature' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR, Role.ADMIN)
    getUploadSignature(): CloudinarySignature {
        const timestamp = Math.round(new Date().getTime() / 1000);
        // Upload as 'upload' (public delivery).
        // Security is enforced at the application level: only enrolled users get the URL.
        const paramsToSign = {
            timestamp,
            folder: 'elearning/courses',
            type: 'upload',
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET || '',
        );

        return {
            timestamp,
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            folder: 'elearning/courses',
            type: 'upload'
        };
    }
}
