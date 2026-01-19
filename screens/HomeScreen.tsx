import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import * as Location from "expo-location";
import { getWeather } from "../services/weather";
import WeatherHeader from "../component/WeatherHeader";
import { getActivityRecommendation } from "../utils/activityRecomender"; // This is now an async function!
import { Place } from "../services/places";
import { Image } from "react-native";
import { BlurView } from 'expo-blur';

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
    setCoords({ latitude, longitude });

    let geo = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (geo.length > 0) {
      const address = geo[0];
      
      // Construct a specific query: "Cuncolim, Goa, India"
      const detailedQuery = `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`;
      
      setCity(address.city || "Unknown");
      loadWeather(detailedQuery); 
    } else {
      loadWeather("Goa, India"); 
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
      <WeatherHeader data={data} city={city} />
      <TouchableOpacity 
          style={styles.rerollButton}
          onPress={refreshRecommendation} // We need to define this function
      >
          <Text style={styles.rerollText}>REFRESH</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Your Plan for Today</Text>
      
      {loadingRecommendations && (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1e90ff" />
              <Text style={styles.loadingText}>Computing best itinerary based on weather...</Text>
          </View>
      )}

      {!loadingRecommendations && recommendation.length === 0 && (
          <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No suitable activities found for current conditions. Maybe stay in and relax?</Text>
          </View>
      )}

      {recommendation.map((place, index) => (
          <BlurView 
            key={index} 
            intensity={15} // Adjust for more/less blur
            style={styles.card}
          >
              {place.photoUrl ? (
              <Image 
                source={{ uri: place.photoUrl }} 
                style={styles.placeImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#999' }}>No Image Available</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.address}</Text>
              <Text style={styles.rating}>⭐ {place.rating}</Text>
              <Text style={styles.aiReason}>{place.aiReason}</Text>

              <TouchableOpacity 
                  style={styles.rerollButton}
                  onPress={() => Linking.openURL(place.googleMapsUri)}
              >
                  <Text style={styles.mapButtonText}>View on Google Maps</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
      ))}
      
      {/* Add extra padding at the bottom for scrolling */}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1d1a39', padding: 20 },
  title: {
    fontFamily: 'Nothing',
    fontSize: 24,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 2, // Essential for the dot-matrix aesthetic
  },
  sectionHeader: {
    fontFamily: 'Nothing',
    fontSize: 26,
    color: '#fff',
    marginTop: 20,
    textTransform: 'uppercase',
    padding: 10,
  },
  card: { 
  borderRadius: 20, 
  marginBottom: 20,
  overflow: 'hidden', // Essential for BlurView to respect borderRadius
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)', // Very subtle white border
  backgroundColor: 'rgba(255, 255, 255, 0.05)', // Almost transparent
},
cardContent: {
    padding: 20, // This creates the "breathing room" for your text
},
placeName: { fontFamily: 'Roboto', fontSize: 16, color: '#fff' },
  placeAddress: { fontFamily: 'Roboto', fontSize: 14, color: '#fff', marginVertical: 4 },
  aiReason: { fontFamily: 'Roboto', fontSize: 14, color: '#fff', marginVertical: 4 },
  rating: { fontFamily: 'Roboto', fontSize: 14, color: '#ffa500', marginBottom: 12 },
  mapButtonText: { 
  fontFamily: 'Nothing',
  color: '#fff',
  fontSize: 16, 
},
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
    backgroundColor: '#AE445A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15
},
rerollText: { 
  fontFamily: 'Nothing',
  color: '#fff',
  fontSize: 22, 
},
placeImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});