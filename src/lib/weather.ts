export interface WeatherReading {
  temperatureCelsius: number;
}

export interface WeatherProvider {
  getTemperature(lat: number, lng: number): Promise<WeatherReading>;
}

// Swap point: implement WeatherProvider against a real weather API and
// change the export below. Used for GCC heat-alert reminders (e.g. warning
// about heat-sensitive medication left in a hot car).
const devWeatherProvider: WeatherProvider = {
  async getTemperature() {
    return { temperatureCelsius: 42 };
  },
};

export const weatherProvider: WeatherProvider = devWeatherProvider;
