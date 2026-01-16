import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import * as Location from "expo-location";
import { getWeather } from "../services/weather";
import WeatherChart from "../component/WeatherChart";
import { getActivityRecommendation } from "../utils/activityRecomender"; // This is now an async function!
import { Place } from "../services/places";

// Define state for coordinates
interface Coords {
    latitude: number;
    longitude: number;
}

export default function HomeScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true); // This tracks the weather load
  const [loadingRecommendations, setLoadingRecommendations] = useState(false); // NEW: Track the recommendation load
  const [recommendation, setRecommendation] = useState<Place[]>([]);
  const [city, setCity] = useState<string>("");
  // NEW STATE: Store the coordinates for use in the recommendation function
  const [coords, setCoords] = useState<Coords | null>(null); 
  useEffect(() => {
    detectLocation();
  }, []);

  
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
      if (data && coords && !isFetching) { // Only fetch if NOT already fetching
          const fetchRecommendation = async () => {
              setIsFetching(true);
              setLoadingRecommendations(true);
              
              try {
                  const locationString = `${data.location.name}, ${data.location.region}`;
                  const result = await getActivityRecommendation(
                      data.current.condition.text,
                      data.current.temp_c,
                      coords.latitude,
                      coords.longitude,
                      locationString
                  );
                  setRecommendation(result);
              } finally {
                  setLoadingRecommendations(false);
                  setIsFetching(false);
              }
          };
          fetchRecommendation();
      }
  }, [data, coords]);

  const detectLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
        alert("Permission denied");
        return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // CRITICAL LOG: Check your terminal for these numbers!
    console.log("DEBUG: Phone GPS Coordinates:", latitude, longitude); 

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

  const refreshRecommendation = async () => {
    if (!coords || !data) return;

    setLoadingRecommendations(true);
    // The engine will re-calculate. 
    // Tip: Since the math is the same, you might want to add a small 
    // random 'noise' to your scores so it picks a different top result!
    const locationName = `${data.location.name}, ${data.location.region}`;

    const result = await getActivityRecommendation(
        data.current.condition.text,
        data.current.temp_c,
        coords.latitude,
        coords.longitude,
        locationName
    );
    setRecommendation(result);
    setLoadingRecommendations(false);
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weather in {city}</Text>
      <Text style={styles.temp}>{data.current.temp_c}°C</Text>
      
      <WeatherChart
        temperatures={data.forecast.forecastday[0].hour.map(
          (h: any) => h.temp_c
        )}
      />

      {/* Add this inside your ScrollView, above the recommendation list */}
      <TouchableOpacity 
          style={styles.rerollButton}
          onPress={refreshRecommendation} // We need to define this function
      >
          <Text style={styles.rerollText}>🔄 Suggest Something Else</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Your Plan for Today</Text>
      
      {/* 1. Loading State for Recommendations */}
      {loadingRecommendations && (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1e90ff" />
              <Text style={styles.loadingText}>Computing best itinerary based on weather...</Text>
          </View>
      )}

      {/* 2. Empty State (When the model returns 0 results) */}
      {!loadingRecommendations && recommendation.length === 0 && (
          <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No suitable activities found for current conditions. Maybe stay in and relax?</Text>
          </View>
      )}

      {/* 3. The Actual List (Your existing map logic) */}
      {recommendation.map((place, index) => (
          <View key={index} style={styles.card}>
              <View style={styles.stepBadge}>
                  <Text style={styles.stepText}>STEP {index + 1}</Text>
              </View>
              
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.address}</Text>
              <Text style={styles.rating}>⭐ {place.rating}</Text>
              <Text style={styles.aiReason}>{place.aiReason}</Text>

              <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => Linking.openURL(place.googleMapsUri)}
              >
                  <Text style={styles.mapButtonText}>View on Google Maps</Text>
              </TouchableOpacity>
          </View>
      ))}
      
      {/* Add extra padding at the bottom for scrolling */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  temp: { fontSize: 48, fontWeight: '300', color: '#1e90ff' },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 30, marginBottom: 15 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20,
    // Shadow for iOS
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    // Elevation for Android
    elevation: 3 
  },
  stepBadge: { 
    backgroundColor: '#1e90ff', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4, 
    marginBottom: 8 
  },
  stepText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  placeName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  placeAddress: { fontSize: 14, color: '#666', marginVertical: 4 },
  aiReason: { fontSize: 14, color: '#666', marginVertical: 4 },
  rating: { fontSize: 14, color: '#ffa500', marginBottom: 12 },
  mapButton: { backgroundColor: '#eef6ff', padding: 10, borderRadius: 8, alignItems: 'center' },
  mapButtonText: { color: '#1e90ff', fontWeight: 'bold' },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22
  },
  rerollButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15
},
rerollText: { color: '#fff', fontWeight: 'bold' }
});