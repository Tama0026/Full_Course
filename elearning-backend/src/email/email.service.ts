import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = this.configService.get<number>('SMTP_PORT');
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port: port || 587,
                secure: port === 465,
                auth: { user, pass },
            });
            console.log(`[EmailService] ✅ SMTP configured: ${host}:${port || 587}`);
        } else {
            console.warn('[EmailService] ⚠️ SMTP credentials not configured. Emails will be logged to console instead.');
        }
    }

    /**
     * Send a congratulatory email with certificate image attached.
     */
    async sendCertificateEmail(
        to: string,
        studentName: string,
        courseName: string,
        certificateUrl: string,
    ): Promise<void> {
        const subject = `🎉 Chúc mừng ${studentName} đã hoàn thành khóa học "${courseName}"!`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0 0 8px; font-size: 28px; }
        .header p { margin: 0; font-size: 16px; opacity: 0.9; }
        .body { padding: 30px; }
        .cert-image { width: 100%; border-radius: 12px; border: 2px solid #e2e8f0; margin: 20px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 16px; }
        .footer { padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Chúc mừng!</h1>
            <p>Bạn đã hoàn thành xuất sắc khóa học</p>
        </div>
        <div class="body">
            <p>Xin chào <strong>${studentName}</strong>,</p>
            <p>Chúng tôi rất vui vì bạn đã hoàn thành khóa học <strong>"${courseName}"</strong>. Đây là chứng chỉ của bạn:</p>
            <img src="${certificateUrl}" alt="Certificate" class="cert-image"/>
            <p>Bạn có thể tải chứng chỉ hoặc chia sẻ thành tựu này với mọi người!</p>
            <a href="${certificateUrl}" class="btn">📥 Xem Chứng Chỉ</a>
            <p style="margin-top: 24px; color: #64748b;">Tiếp tục hành trình học tập của bạn tại nền tảng của chúng tôi. Chúc bạn thành công!</p>
        </div>
        <div class="footer">
            <p>E-Learning Platform • Email tự động</p>
        </div>
    </div>
</body>
</html>
        `;

        if (this.transporter) {
            try {
                const fromEmail = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');
                await this.transporter.sendMail({
                    from: `"E-Learning Platform" <${fromEmail}>`,
                    to,
                    subject,
                    html,
                });
                console.log(`[EmailService] ✅ Certificate email sent to ${to}`);
            } catch (error: any) {
                console.error(`[EmailService] ❌ Failed to send email to ${to}:`, error.message);
            }
        } else {
            // Fallback: log to console
            console.log(`[EmailService] 📧 (MOCK) Certificate email would be sent to: ${to}`);
            console.log(`[EmailService] 📧 Subject: ${subject}`);
            console.log(`[EmailService] 📧 Certificate URL: ${certificateUrl}`);
        }
    }
}
