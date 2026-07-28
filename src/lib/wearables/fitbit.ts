import type { WearableProvider } from "./types";

export const fitbitProvider: WearableProvider = {
  name: "FITBIT",
  getAuthUrl(patientProfileId) {
    return `/api/wearables/connect?provider=FITBIT&patientProfileId=${patientProfileId}`;
  },
  async handleCallback() {
    return { accessToken: "dev-fitbit-token" };
  },
  async fetchSamples(_tokens, since) {
    return [
      { type: "STEPS", value: 6200, recordedAt: since },
      { type: "HEART_RATE", value: 72, recordedAt: since },
      { type: "SLEEP", value: 420, recordedAt: since },
    ];
  },
};
