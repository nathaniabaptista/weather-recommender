export async function getWeather(location: string) {
  const API_KEY = "YOUR_API_KEY"; 
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no`;

  const res = await fetch(url);
  return await res.json();
}
