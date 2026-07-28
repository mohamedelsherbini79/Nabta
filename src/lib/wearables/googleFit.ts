import type { WearableProvider } from "./types";

export const googleFitProvider: WearableProvider = {
  name: "GOOGLE_FIT",
  getAuthUrl(patientProfileId) {
    return `/api/wearables/connect?provider=GOOGLE_FIT&patientProfileId=${patientProfileId}`;
  },
  async handleCallback() {
    return { accessToken: "dev-google-fit-token" };
  },
  async fetchSamples(_tokens, since) {
    return [
      { type: "STEPS", value: 5400, recordedAt: since },
      { type: "HEART_RATE", value: 75, recordedAt: since },
    ];
  },
};
