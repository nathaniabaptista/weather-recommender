export async function getWeather(location: string) {
  const API_KEY = "6d261cf3a4714026b4f110558251611";
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no`;

  try {
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
