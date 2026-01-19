import { View, Text, StyleSheet } from "react-native";

type Props = {
  data: any;
  city: string;
};

// Map weather conditions to colors/icons
const getWeatherStyle = (condition: string) => {
  const lowerCond = condition.toLowerCase();
  if (lowerCond.includes('sun') || lowerCond.includes('clear')) return { bg: '#f5b784ff', icon: '☀️' };
  if (lowerCond.includes('cloud')) return { bg: '#E8BCB9', icon: '☁️' };
  if (lowerCond.includes('rain')) return { bg: '#451952', icon: '🌧️' };
  return { bg: '#111', icon: '✨' };
};

export default function WeatherHeader({ data, city }: Props) {
  const weatherStyle = getWeatherStyle(data.current.condition.text);

  return (
    <View style={[styles.weatherCard, { backgroundColor: weatherStyle.bg }]}>
      <View style={styles.cardTopRow}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
        <Text style={styles.locationText}>{city}</Text>
      </View>

      <View style={styles.cardMainRow}>
        <Text style={styles.mainTempText}>{Math.round(data.current.temp_c)}°</Text>
        <View style={styles.conditionBox}>
          <Text style={styles.conditionIcon}>{weatherStyle.icon}</Text>
          <Text style={styles.conditionText}>{data.current.condition.text}</Text>
        </View>
      </View>

      <View style={styles.extraInfoRow}>
        <Text style={styles.extraText}>FEELS LIKE: {data.current.feelslike_c}°</Text>
        <Text style={styles.extraText}>WIND: {data.current.wind_kph} KPH</Text>
        <Text style={styles.extraText}>UV: {data.current.uv}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weatherCard: { padding: 24, borderRadius: 28, marginTop: 20, minHeight: 220, justifyContent: 'space-between' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontFamily: 'Nothing', color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  locationText: { fontFamily: 'Nothing', color: '#fff', fontSize: 14, textTransform: 'uppercase' },
  cardMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  mainTempText: { fontFamily: 'Nothing', color: '#fff', fontSize: 84 },
  conditionBox: { alignItems: 'flex-end' },
  conditionIcon: { fontSize: 32, marginBottom: 4 },
  conditionText: { fontFamily: 'Nothing', color: '#fff', fontSize: 14, textTransform: 'uppercase' },
  extraInfoRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 15 },
  extraText: { fontFamily: 'Nothing', color: 'rgba(255,255,255,0.8)', fontSize: 10 },
});