export type WearableProviderName = "FITBIT" | "APPLE_HEALTH" | "GOOGLE_FIT" | "SAMSUNG_HEALTH";

export type WearableSampleType = "SLEEP" | "HEART_RATE" | "STEPS" | "SPO2";

export interface WearableSampleData {
  type: WearableSampleType;
  value: number;
  recordedAt: Date;
}

export interface WearableTokens {
  accessToken: string;
  refreshToken?: string;
}

// Swap point: each provider file implements this against the vendor's real
// OAuth + data API (Fitbit Web API, Apple HealthKit, Google Fit, Samsung
// Health). Dev implementations return synthetic samples.
export interface WearableProvider {
  name: WearableProviderName;
  getAuthUrl(patientProfileId: string): string;
  handleCallback(code: string): Promise<WearableTokens>;
  fetchSamples(tokens: WearableTokens, since: Date): Promise<WearableSampleData[]>;
}
