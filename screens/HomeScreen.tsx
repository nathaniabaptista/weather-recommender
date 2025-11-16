import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { getWeather } from "../services/weather";
import WeatherChart from "../component/WeatherChart";
import { getActivityRecommendation } from "../utils/activityRecomender"; // This is now an async function!

// Define state for coordinates
interface Coords {
    latitude: number;
    longitude: number;
}

export default function HomeScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<string>("");
  // NEW STATE: Store the coordinates for use in the recommendation function
  const [coords, setCoords] = useState<Coords | null>(null); 

  // --- NEW ASYNC LOGIC for Recommendation ---
  const [recommendation, setRecommendation] = useState<string>("");

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    // We only run this when the weather data and coordinates are available
    if (data && coords) {
        // Define a function to fetch the recommendation
        const fetchRecommendation = async () => {
            const result = await getActivityRecommendation(
                data.current.condition.text,
                data.current.temp_c,
                coords.latitude, // PASSING COORDS
                coords.longitude // PASSING COORDS
            );
            setRecommendation(result);
        };
        fetchRecommendation();
    }
  }, [data, coords]); // Run whenever weather data or coordinates update

  const detectLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("Permission to access location was denied.");
      setLoading(false);
      return;
    }

    // 1. Get GPS coordinates
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    
    // NEW: Save coordinates to state immediately
    setCoords({ latitude, longitude }); 

    // 2. Reverse geocode → Get city name
    let geo = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (geo.length > 0) {
      setCity(geo[0].city || "Unknown");
      // Pass the city name (location) to loadWeather
      loadWeather(geo[0].city || "Goa"); 
    } else {
      loadWeather("Goa"); // default fallback
    }
  };

  // UPDATED: This function is now responsible for setting the recommendation too!
  const loadWeather = async (location: string) => {
    const weatherData = await getWeather(location);

    if (!weatherData) {
      setLoading(false);
      return;
    }

    setData(weatherData);
    setLoading(false);
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;

  if (!data || !coords) { // Check that we have both data and coordinates
    return (
      <Text style={{ marginTop: 100, padding: 20 }}>
        Failed to load necessary data (weather or location).
      </Text>
    );
  }

  if (!recommendation) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }
  // --- END NEW ASYNC LOGIC ---

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather in {city}</Text>
      <Text style={styles.temp}>{data.current.temp_c}°C</Text>

      <WeatherChart
        temperatures={data.forecast.forecastday[0].hour.map(
          (h: any) => h.temp_c
        )}
      />

      {/* RENDER THE RECOMMENDATION STATE */}
      <Text style={styles.suggestion}>{recommendation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  temp: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
  suggestion: { marginTop: 30, fontSize: 18, fontWeight: '500' },
});