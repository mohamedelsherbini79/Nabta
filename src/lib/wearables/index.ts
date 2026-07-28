import type { WearableProvider, WearableProviderName } from "./types";
import { fitbitProvider } from "./fitbit";
import { appleHealthProvider } from "./appleHealth";
import { googleFitProvider } from "./googleFit";
import { samsungHealthProvider } from "./samsungHealth";

export * from "./types";

export const wearableProviders: Record<WearableProviderName, WearableProvider> = {
  FITBIT: fitbitProvider,
  APPLE_HEALTH: appleHealthProvider,
  GOOGLE_FIT: googleFitProvider,
  SAMSUNG_HEALTH: samsungHealthProvider,
};
