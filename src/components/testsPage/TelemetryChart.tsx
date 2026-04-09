import { useSelector } from "react-redux";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RootState } from "../../store/store";

export default function TelemetryChart() {
  // Достаем историю измерений из Redux
  const history = useSelector((state: RootState) => state.realtime.history);

  if (history.length === 0) {
    return (
      <div style={{ marginTop: 20, color: "#626c71" }}>
        Нет данных для отображения графика...
      </div>
    );
  }

  return (
    <div
      style={{
        height: 300,
        width: "100%",
        marginTop: 20,
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        border: "1px solid #e8e8e8",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 16,
          color: "#1f2121",
          fontSize: 16,
        }}
      >
        Телеметрия в реальном времени
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#a7a9a9" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#a7a9a9"
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2180a0"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false} // Отключаем анимацию для потоковых данных
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
