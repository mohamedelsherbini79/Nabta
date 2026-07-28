export interface OtpSender {
  sendOtp(phone: string, code: string): Promise<void>;
}

// Swap point: implement OtpSender against a real provider (e.g. Twilio) and
// change the export below — no call site needs to change.
const devOtpSender: OtpSender = {
  async sendOtp(phone, code) {
    console.log(`[otp:dev] Would send OTP ${code} to ${phone}`);
  },
};

export const otpSender: OtpSender = devOtpSender;
