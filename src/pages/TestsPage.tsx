import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import TestWizard from "../components/testsPage/TestWizard";

export default function TestsPage() {
  const { isConnected } = useSelector((s: RootState) => s.telemetry);
  const { activeSession } = useSelector((s: RootState) => s.testing);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ color: "#1f2121", margin: 0 }}>Панель проведения испытаний</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#626c71" }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: isConnected ? "#22c25d" : "#e8e8e8",
                display: "inline-block",
                boxShadow: isConnected ? "0 0 6px #22c25d" : "none",
              }}
            />
            WebSocket: {isConnected ? "Подключен" : "Ожидание"}
          </div>

          {activeSession && (
            <div
              style={{
                fontSize: 13,
                padding: "4px 12px",
                borderRadius: 20,
                background:
                  activeSession.status === "RUNNING" ? "rgba(33,128,160,0.1)" :
                  activeSession.status === "COMPLETED" ? "rgba(34,194,93,0.1)" :
                  "rgba(230,129,97,0.1)",
                color:
                  activeSession.status === "RUNNING" ? "#2180a0" :
                  activeSession.status === "COMPLETED" ? "#22c25d" : "#e68161",
                fontWeight: 500,
              }}
            >
              Сессия #{activeSession.id} · {activeSession.status}
            </div>
          )}
        </div>
      </div>

      <TestWizard />
    </div>
  );
}
