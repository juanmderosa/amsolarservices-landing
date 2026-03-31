import mailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export default class MailingService {
  private static transporter: Transporter;

  private static getTransporter() {
    if (!this.transporter) {
      const port = parseInt(import.meta.env.MAILING_PORT || "587");

      const secure = import.meta.env.MAILING_SECURE === "true" || port === 465;

      this.transporter = mailer.createTransport({
        host: import.meta.env.MAILING_HOST,
        port,
        secure,
        auth: {
          user: import.meta.env.MAILING_USER,
          pass: import.meta.env.MAILING_PASSWORD,
        },
        tls: {
          // Allow self-signed certs on some Hostinger environments
          rejectUnauthorized: false,
        },
      });
    }
    return this.transporter;
  }

  static async sendMail({ from, to, subject, html }: MailOptions) {
    const client = this.getTransporter();

    try {
      // Verify connection before sending
      await client.verify();
    } catch (verifyError) {
      console.error("SMTP connection failed:", verifyError);
      return { success: false, error: verifyError };
    }

    try {
      const info = await client.sendMail({
        from:
          from || import.meta.env.MAILING_FROM || import.meta.env.MAILING_USER,
        to,
        subject,
        html,
      });
      console.log("✅ Email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Nodemailer sendMail error:", error);
      return { success: false, error };
    }
  }
}
