import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface TelemetryState {
  isConnected: boolean;
  sourceIp: string | null;
  currentValue: number | null;
  history: { time: string; value: number }[];
  logs: string[];
}

const initialState: TelemetryState = {
  isConnected: false,
  sourceIp: null,
  currentValue: null,
  history: [],
  logs: [],
};

export const telemetrySlice = createSlice({
  name: "telemetry",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      const statusLog = action.payload
        ? "Установлено STOMP соединение"
        : "Соединение разорвано";
      state.logs.push(`[${new Date().toLocaleTimeString()}] ${statusLog}`);
    },
    setSourceIp: (state, action: PayloadAction<string>) => {
      state.sourceIp = action.payload;
    },
    receiveTelemetry: (state, action: PayloadAction<number>) => {
      state.currentValue = action.payload;

      const newPoint = {
        time: new Date().toLocaleTimeString(),
        value: action.payload,
      };

      state.history.push(newPoint);
      if (state.history.length > 50) {
        state.history.shift();
      }
    },
    addLog: (state, action: PayloadAction<string>) => {
      state.logs.push(`[${new Date().toLocaleTimeString()}] ${action.payload}`);
    },
  },
});

export const { setConnectionStatus, setSourceIp, receiveTelemetry, addLog } =
  telemetrySlice.actions;
export default telemetrySlice.reducer;
