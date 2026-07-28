export interface NotificationProvider {
  sendSms(to: string, body: string): Promise<void>;
  makeVoiceCall(to: string, message: string): Promise<void>;
}

export class TwilioNotConfiguredError extends Error {
  constructor() {
    super("Twilio is not configured (missing TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER).");
    this.name = "TwilioNotConfiguredError";
  }
}

function twilioCredentials(): { accountSid: string; authToken: string; fromNumber: string } {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !fromNumber) {
    throw new TwilioNotConfiguredError();
  }
  return { accountSid, authToken, fromNumber };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function twilioRequest(accountSid: string, authToken: string, resource: string, params: Record<string, string>) {
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/${resource}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
    },
    body: new URLSearchParams(params),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Twilio ${resource} failed: ${data?.message ?? res.statusText}`);
  }
}

// Twilio REST API (no SDK): https://www.twilio.com/docs/sms/send-messages
const twilioProvider: NotificationProvider = {
  async sendSms(to, body) {
    const { accountSid, authToken, fromNumber } = twilioCredentials();
    await twilioRequest(accountSid, authToken, "Messages.json", { To: to, From: fromNumber, Body: body });
  },

  async makeVoiceCall(to, message) {
    const { accountSid, authToken, fromNumber } = twilioCredentials();
    const twiml = `<Response><Say>${escapeXml(message)}</Say></Response>`;
    await twilioRequest(accountSid, authToken, "Calls.json", { To: to, From: fromNumber, Twiml: twiml });
  },
};

export const notificationProvider: NotificationProvider = twilioProvider;
