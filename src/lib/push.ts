export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushSender {
  sendPush(userId: string, payload: PushPayload): Promise<void>;
}

// Swap point: implement PushSender against FCM/APNs (needs a DeviceToken
// model to store per-device push tokens) and change the export below.
const devPushSender: PushSender = {
  async sendPush(userId, payload) {
    console.log(`[push:dev] Would notify user ${userId}: ${payload.title} — ${payload.body}`);
  },
};

export const pushSender: PushSender = devPushSender;
