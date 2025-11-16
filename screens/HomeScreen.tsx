import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getWeather } from "../services/weather";
import WeatherChart from "../component/WeatherChart";
import { getActivityRecommendation } from "../utils/activityRecomender";

export default function HomeScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    const weatherData = await getWeather("Goa");
    setData(weatherData);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;

  const recommendation = getActivityRecommendation(
    data.current.condition.text,
    "Goa"
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather in Goa</Text>
      <Text style={styles.temp}>{data.current.temp_c}°C</Text>

      <WeatherChart temperatures={data.forecast.forecastday[0].hour.map((h: any) => h.temp_c)} />

      <Text style={styles.suggestion}>
        🌦 {recommendation}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  temp: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
  suggestion: { marginTop: 30, fontSize: 18 }
});
