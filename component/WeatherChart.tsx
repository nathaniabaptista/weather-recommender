import { View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

type Props = {
  temperatures: number[];
};

export default function WeatherChart({ temperatures }: Props) {
  if (!temperatures || temperatures.length === 0) return null;

  const width = 320;
  const height = 160;

  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);

  const points = temperatures
    .map((temp, index) => {
      const x = (index / (temperatures.length - 1)) * width;
      const y =
        height - ((temp - minTemp) / (maxTemp - minTemp || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={{ marginTop: 20 }}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke="#1e90ff"
          strokeWidth={3}
        />
      </Svg>
    </View>
  );
}
