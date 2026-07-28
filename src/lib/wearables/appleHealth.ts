import type { WearableProvider } from "./types";

export const appleHealthProvider: WearableProvider = {
  name: "APPLE_HEALTH",
  getAuthUrl(patientProfileId) {
    return `/api/wearables/connect?provider=APPLE_HEALTH&patientProfileId=${patientProfileId}`;
  },
  async handleCallback() {
    return { accessToken: "dev-apple-health-token" };
  },
  async fetchSamples(_tokens, since) {
    return [
      { type: "STEPS", value: 8100, recordedAt: since },
      { type: "HEART_RATE", value: 68, recordedAt: since },
      { type: "SPO2", value: 98, recordedAt: since },
    ];
  },
};
