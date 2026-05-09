import { describe, it, expect } from "vitest";
import reducer, {
  receiveTelemetry,
  setConnectionStatus,
  setSourceIp,
  resetTelemetry,
} from "./telemetrySlice";
import type { PlcDataMessage } from "../../types/api";

const makePoint = (v: number): PlcDataMessage => ({
  dutOutputVoltage: v,
  phase: 1,
  dutErrorFlag: 0,
  dutHeartbeat: 42,
});

describe("telemetrySlice", () => {
  it("Тест 1: приём телеметрии сохраняет latest и добавляет точку в history", () => {
    const state = reducer(undefined, receiveTelemetry(makePoint(220)));
    expect(state.latest?.dutOutputVoltage).toBe(220);
    expect(state.history).toHaveLength(1);
    expect(state.history[0].dutOutputVoltage).toBe(220);
  });

  it("Тест 2: history не превышает 100 точек (лимит скользящего окна)", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    for (let i = 0; i < 105; i++) {
      state = reducer(state, receiveTelemetry(makePoint(i)));
    }
    expect(state.history).toHaveLength(100);
    // старые точки вытеснены, первая точка теперь индекс 5
    expect(state.history[0].dutOutputVoltage).toBe(5);
  });

  it("Тест 3: NaN в dutOutputVoltage не падает редьюсер, значение сохраняется", () => {
    const point: PlcDataMessage = {
      dutOutputVoltage: NaN,
      phase: null,
      dutErrorFlag: null,
      dutHeartbeat: null,
    };
    const state = reducer(undefined, receiveTelemetry(point));
    expect(state.history).toHaveLength(1);
    expect(state.latest).toBeTruthy();
    expect(Number.isNaN(state.history[0].dutOutputVoltage)).toBe(true);
  });

  it("Тест 4: resetTelemetry полностью очищает состояние", () => {
    let state = reducer(undefined, setConnectionStatus(true));
    state = reducer(state, setSourceIp("192.168.1.1"));
    state = reducer(state, receiveTelemetry(makePoint(220)));
    state = reducer(state, resetTelemetry());

    expect(state.isConnected).toBe(false);
    expect(state.sourceIp).toBeNull();
    expect(state.latest).toBeNull();
    expect(state.history).toHaveLength(0);
    expect(state.logs).toHaveLength(0);
  });
});
