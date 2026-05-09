import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TelemetryChart() {
  const history = useSelector((state: RootState) => state.telemetry.history);

  if (history.length === 0) {
    return (
      <div style={{ marginTop: 20, color: "#626c71", textAlign: "center" }}>
        Ожидание поступления данных...
      </div>
    );
  }

  return (
    <div
      style={{
        height: 320,
        width: "100%",
        marginTop: 20,
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        border: "1px solid #e8e8e8",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12, color: "#1f2121", fontSize: 15 }}>
        Телеметрия в реальном времени
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#a7a9a9" />
          <YAxis tick={{ fontSize: 11 }} stroke="#a7a9a9" domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="dutOutputVoltage"
            name="Напряжение (V)"
            stroke="#2180a0"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="phase"
            name="Фаза"
            stroke="#22c25d"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="dutHeartbeat"
            name="Heartbeat"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="dutErrorFlag"
            name="Ошибка"
            stroke="#e68161"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
