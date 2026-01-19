export async function getWeather(location: string) {
  const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  
  // Fix: Use the same variable name here!
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=1&aqi=no`;

  try {
    // Optional: Log a warning if the key is missing from .env
    if (!WEATHER_API_KEY) {
      console.warn("Missing Weather API Key in environment variables!");
    }

    const res = await fetch(url);
    const json = await res.json();

    console.log("Weather API Response:", json);

    if (json.error) {
      console.error("Weather API error:", json.error);
      throw new Error(json.error.message);
    }

    return json;
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}