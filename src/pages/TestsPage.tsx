import { useState, useEffect } from "react";
import { useStomp } from "../hooks/useStomp";
import { useSelector, useDispatch } from "react-redux";

import { setSourceIp, receiveTelemetry } from "../store/slices/telemetrySlice";
import type { RootState } from "../store/store";

import TestWizard from "../components/testsPage/TestWizard";

export default function TestsPage() {
  const [ipInput, setIpInput] = useState<string>("127.0.0.1");
  const [isMocking, setIsMocking] = useState<boolean>(false);

  const dispatch = useDispatch();
  const { isConnected, sourceIp } = useSelector(
    (state: RootState) => state.telemetry,
  );

  const { sendMessage } = useStomp(sourceIp || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSourceIp(ipInput.trim()));
  };

  // Эффект для генерации фейковых данных
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isMocking) {
      interval = setInterval(() => {
        // Генерируем значение от 20 до 30 (например, вольтаж)
        const fakeValue = Number((20 + Math.random() * 10).toFixed(2));
        dispatch(receiveTelemetry(fakeValue));
      }, 1000); // Раз в секунду
    }
    return () => clearInterval(interval);
  }, [isMocking, dispatch]);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ color: "#1f2121" }}>Панель проведения испытаний</h1>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>
          Статус сервера: {isConnected ? "🟢 Online" : "🔴 Offline"}
        </h2>

        <button
          onClick={() => setIsMocking(!isMocking)}
          style={{
            padding: "8px 16px",
            background: isMocking ? "#e68161" : "#22c25d",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "cursor",
            fontWeight: "bold",
          }}
        >
          {isMocking ? "Остановить симуляцию" : "Запустить симуляцию данных"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Левая колонка: Управление и график */}
        <div>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, marginBottom: 20 }}
          >
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="IP стенда (sourceIp)"
              style={{
                padding: "8px 12px",
                border: "1px solid #e8e8e8",
                borderRadius: 6,
                flex: 1,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: "#2180a0",
                color: "white",
                border: "none",
                borderRadius: 6,
              }}
            >
              Подключиться
            </button>
          </form>
          {/* 
          <div style={{ fontSize: 48, fontWeight: "bold", color: "#2180a0" }}>
            {currentValue !== null ? currentValue : "--"}{" "}
            <span style={{ fontSize: 24, color: "#626c71" }}>V</span>
          </div> */}

          {/* <TelemetryChart /> */}
        </div>

        {/* Правая колонка: Журнал событий */}
        {/* <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 8,
            padding: 16,
            height: 500,
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              borderBottom: "1px solid #e8e8e8",
              paddingBottom: 12,
            }}
          >
            Журнал событий
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: 13,
                  color: "#626c71",
                  fontFamily: "monospace",
                }}
              >
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div style={{ fontSize: 13, color: "#a7a9a9" }}>
                Журнал пуст...
              </div>
            )}
          </div>
        </div> */}
        <div style={{ marginTop: 40 }}>
          <TestWizard />
        </div>
      </div>
    </div>
  );
}
