// Callers must escape any user-supplied value (name, free-text fields, etc.)
// before interpolating it into `EmailMessage.html` — this module sends the
// HTML as-is.
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export interface EmailSender {
  sendEmail(message: EmailMessage): Promise<void>;
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email is not configured (missing RESEND_API_KEY).");
    this.name = "EmailNotConfiguredError";
  }
}

// Resend REST API (no SDK): https://resend.com/docs/api-reference/emails/send-email
const resendSender: EmailSender = {
  async sendEmail(message) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new EmailNotConfiguredError();

    const from = process.env.EMAIL_FROM || "Nabta <onboarding@resend.dev>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        attachments: message.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString("base64"),
        })),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(`Resend send failed: ${data?.message ?? res.statusText}`);
    }
  },
};

export const emailSender: EmailSender = resendSender;
