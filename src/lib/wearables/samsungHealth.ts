import type { WearableProvider } from "./types";

export const samsungHealthProvider: WearableProvider = {
  name: "SAMSUNG_HEALTH",
  getAuthUrl(patientProfileId) {
    return `/api/wearables/connect?provider=SAMSUNG_HEALTH&patientProfileId=${patientProfileId}`;
  },
  async handleCallback() {
    return { accessToken: "dev-samsung-health-token" };
  },
  async fetchSamples(_tokens, since) {
    return [
      { type: "STEPS", value: 7300, recordedAt: since },
      { type: "SLEEP", value: 390, recordedAt: since },
    ];
  },
};
