import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private transporter;
    constructor(configService: ConfigService);
    sendCertificateEmail(to: string, studentName: string, courseName: string, certificateUrl: string): Promise<void>;
}
