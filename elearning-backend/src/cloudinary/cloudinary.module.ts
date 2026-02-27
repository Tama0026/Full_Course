import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryResolver } from './cloudinary.resolver';

@Global()
@Module({
    providers: [CloudinaryService, CloudinaryResolver],
    exports: [CloudinaryService],
})
export class CloudinaryModule { }
