import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PlcDataMessage } from "../../types/api";

export interface TelemetryPoint {
  time: string;
  dutOutputVoltage: number | null;
  phase: number | null;
  dutErrorFlag: number | null;
  dutHeartbeat: number | null;
}

interface TelemetryState {
  isConnected: boolean;
  sourceIp: string | null;
  latest: PlcDataMessage | null;
  history: TelemetryPoint[];
  logs: string[];
}

const initialState: TelemetryState = {
  isConnected: false,
  sourceIp: null,
  latest: null,
  history: [],
  logs: [],
};

export const telemetrySlice = createSlice({
  name: "telemetry",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      const msg = action.payload
        ? "Установлено STOMP соединение"
        : "Соединение разорвано";
      state.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    },
    setSourceIp: (state, action: PayloadAction<string>) => {
      state.sourceIp = action.payload;
    },
    receiveTelemetry: (state, action: PayloadAction<PlcDataMessage>) => {
      state.latest = action.payload;
      const point: TelemetryPoint = {
        time: new Date().toLocaleTimeString(),
        dutOutputVoltage: action.payload.dutOutputVoltage,
        phase: action.payload.phase,
        dutErrorFlag: action.payload.dutErrorFlag,
        dutHeartbeat: action.payload.dutHeartbeat,
      };
      state.history.push(point);
      if (state.history.length > 100) {
        state.history.shift();
      }
    },
    addLog: (state, action: PayloadAction<string>) => {
      state.logs.push(
        `[${new Date().toLocaleTimeString()}] ${action.payload}`
      );
    },
    resetTelemetry: (state) => {
      state.latest = null;
      state.history = [];
      state.logs = [];
      state.isConnected = false;
      state.sourceIp = null;
    },
  },
});

export const {
  setConnectionStatus,
  setSourceIp,
  receiveTelemetry,
  addLog,
  resetTelemetry,
} = telemetrySlice.actions;
export default telemetrySlice.reducer;
