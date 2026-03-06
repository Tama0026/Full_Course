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
      console.warn(
        '[EmailService] ⚠️ SMTP credentials not configured. Emails will be logged to console instead.',
      );
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
    const subject = `Chúc mừng ${studentName} đã hoàn thành khóa học "${courseName}"!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 32px 30px; text-align: center; color: white; }
        .header h1 { margin: 0 0 8px; font-size: 24px; font-weight: 600; }
        .header p { margin: 0; font-size: 15px; color: #cbd5e1; }
        .body { padding: 40px 30px; color: #334155; line-height: 1.6; }
        .cert-image { width: 100%; border-radius: 6px; border: 1px solid #e2e8f0; margin: 20px 0; }
        .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 20px; transition: background-color 0.2s; }
        .btn:hover { background: #4338ca; }
        .footer { padding: 24px 30px; text-align: center; color: #64748b; font-size: 13px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Chúc mừng bạn!</h1>
            <p>Bạn đã hoàn thành xuất sắc khóa học</p>
        </div>
        <div class="body">
            <p>Xin chào <strong>${studentName}</strong>,</p>
            <p>Chúng tôi rất vui vì bạn đã hoàn thành khóa học <strong>"${courseName}"</strong>. Đây là chứng chỉ của bạn:</p>
            <img src="${certificateUrl}" alt="Certificate" class="cert-image"/>
            <p>Bạn có thể tải chứng chỉ hoặc chia sẻ thành tựu này với bạn bè và đồng nghiệp.</p>
            <div style="text-align: center;">
                <a href="${certificateUrl}" class="btn">Xem Chứng Chỉ</a>
            </div>
            <p style="margin-top: 32px; color: #64748b; font-size: 14px;">Tiếp tục hành trình học tập của bạn tại nền tảng của chúng tôi. Xin chúc mừng thành công của bạn!</p>
        </div>
        <div class="footer">
            <p>E-Learning Platform &bull; Hệ thống tự động</p>
        </div>
    </div>
</body>
</html>
        `;

    if (this.transporter) {
      try {
        const fromEmail =
          this.configService.get<string>('SMTP_FROM') ||
          this.configService.get<string>('SMTP_USER');
        await this.transporter.sendMail({
          from: `"E-Learning Platform" <${fromEmail}>`,
          to,
          subject,
          html,
        });
        console.log(`[EmailService] ✅ Certificate email sent to ${to}`);
      } catch (error: any) {
        console.error(
          `[EmailService] ❌ Failed to send email to ${to}:`,
          error.message,
        );
      }
    } else {
      // Fallback: log to console
      console.log(
        `[EmailService] 📧 (MOCK) Certificate email would be sent to: ${to}`,
      );
      console.log(`[EmailService] 📧 Subject: ${subject}`);
      console.log(`[EmailService] 📧 Certificate URL: ${certificateUrl}`);
    }
  }

  /**
   * Send an email to notify student that their enrollment was approved.
   */
  async sendEnrollmentApprovedEmail(
    to: string,
    studentName: string,
    courseName: string,
    courseUrl: string,
  ): Promise<void> {
    const subject = `Đơn đăng ký khóa học "${courseName}" của bạn đã được phê duyệt!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 32px 30px; text-align: center; color: white; }
        .header h1 { margin: 0 0 8px; font-size: 24px; font-weight: 600; }
        .header p { margin: 0; font-size: 15px; color: #cbd5e1; }
        .body { padding: 40px 30px; color: #334155; line-height: 1.6; }
        .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 20px; transition: background-color 0.2s; }
        .btn:hover { background: #4338ca; }
        .footer { padding: 24px 30px; text-align: center; color: #64748b; font-size: 13px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Đăng ký thành công!</h1>
            <p>Khóa học hiện đã sẵn sàng</p>
        </div>
        <div class="body">
            <p>Xin chào <strong>${studentName}</strong>,</p>
            <p>Chúng tôi xin thông báo yêu cầu tham gia khóa học <strong>"${courseName}"</strong> của bạn đã được giảng viên phê duyệt.</p>
            <p>Ngay lúc này, bạn đã có thể truy cập đầy đủ bài giảng, tài liệu tham khảo và tham gia các bài kiểm tra.</p>
            <div style="text-align: center;">
                <a href="${courseUrl}" class="btn">Bắt Đầu Học Ngay</a>
            </div>
            <p style="margin-top: 32px; color: #64748b; font-size: 14px;">Chúc bạn có những trải nghiệm học tập thật hữu ích cùng khóa học này.</p>
        </div>
        <div class="footer">
            <p>E-Learning Platform &bull; Hệ thống tự động</p>
        </div>
    </div>
</body>
</html>
        `;

    if (this.transporter) {
      try {
        const fromEmail =
          this.configService.get<string>('SMTP_FROM') ||
          this.configService.get<string>('SMTP_USER');
        await this.transporter.sendMail({
          from: `"E-Learning Platform" <${fromEmail}>`,
          to,
          subject,
          html,
        });
        console.log(
          `[EmailService] ✅ Enrollment accepted email sent to ${to}`,
        );
      } catch (error: any) {
        console.error(
          `[EmailService] ❌ Failed to send email to ${to}:`,
          error.message,
        );
      }
    } else {
      console.log(
        `[EmailService] 📧 (MOCK) Enrollment accepted email would be sent to: ${to}`,
      );
      console.log(`[EmailService] 📧 Subject: ${subject}`);
    }
  }

  /**
   * Send a learning reminder email.
   */
  async sendLearningReminderEmail(
    to: string,
    studentName: string,
    courseName: string,
    instructorName: string,
    courseUrl: string,
  ): Promise<void> {
    const subject = `Tiếp tục khóa học "${courseName}" nhé, ${studentName}!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 32px 30px; text-align: center; color: white; }
        .header h1 { margin: 0 0 8px; font-size: 24px; font-weight: 600; }
        .header p { margin: 0; font-size: 15px; color: #cbd5e1; }
        .body { padding: 40px 30px; color: #334155; line-height: 1.6; }
        .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 20px; transition: background-color 0.2s; }
        .btn:hover { background: #4338ca; }
        .footer { padding: 24px 30px; text-align: center; color: #64748b; font-size: 13px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thông báo học tập</h1>
            <p>Hành trình của bạn vẫn đang tiếp diễn</p>
        </div>
        <div class="body">
            <p>Xin chào <strong>${studentName}</strong>,</p>
            <p>Giảng viên <strong>${instructorName}</strong> nhận thấy đã một thời gian bạn chưa quay lại học khóa học <strong>"${courseName}"</strong>. Bạn có đang gặp khó khăn gì trong quá trình tiếp thu kiến thức không?</p>
            <p>Việc học tập đều đặn mỗi ngày một chút sẽ mang lại kết quả lâu dài. Hãy dành ra khoảng 15 đến 30 phút hôm nay để hoàn thành bài học tiếp theo nhé.</p>
            <div style="text-align: center;">
                <a href="${courseUrl}" class="btn">Tiếp Tục Học Ngay</a>
            </div>
            <p style="margin-top: 32px; color: #64748b; font-size: 14px;">Sự nỗ lực và kiên trì rèn luyện chuyên môn chắc chắn sẽ mang lại kết quả tốt.</p>
        </div>
        <div class="footer">
            <p>E-Learning Platform &bull; Hệ thống tự động</p>
        </div>
    </div>
</body>
</html>
        `;

    if (this.transporter) {
      try {
        const fromEmail =
          this.configService.get<string>('SMTP_FROM') ||
          this.configService.get<string>('SMTP_USER');
        await this.transporter.sendMail({
          from: `"E-Learning Platform" <${fromEmail}>`,
          to,
          subject,
          html,
        });
        console.log(
          `[EmailService] ✅ Learning reminder email sent to ${to}`,
        );
      } catch (error: any) {
        console.error(
          `[EmailService] ❌ Failed to send email to ${to}:`,
          error.message,
        );
      }
    } else {
      console.log(
        `[EmailService] 📧 (MOCK) Learning reminder email would be sent to: ${to}`,
      );
      console.log(`[EmailService] 📧 Subject: ${subject}`);
    }
  }
}
