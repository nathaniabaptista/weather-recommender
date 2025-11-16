import { LineChart } from "react-native-svg-charts";

export default function WeatherChart({ temperatures }: { temperatures: number[] }) {
  return (
    <LineChart
      style={{ height: 150 }}
      data={temperatures}
      svg={{ stroke: "blue" }}
      contentInset={{ top: 20, bottom: 20 }}
    />
  );
}
