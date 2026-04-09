import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface RealtimeState {
  isConnected: boolean;
  sourceIp: string | null;
  currentValue: number | null;
  history: { time: string; value: number }[]; // Массив для отрисовки графиков Recharts
  logs: string[]; // Журнал событий
}

const initialState: RealtimeState = {
  isConnected: false,
  sourceIp: null,
  currentValue: null,
  history: [],
  logs: [],
};

export const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      const statusLog = action.payload
        ? "✅ Установлено STOMP соединение"
        : "❌ Соединение разорвано";
      state.logs.push(`[${new Date().toLocaleTimeString()}] ${statusLog}`);
    },
    setSourceIp: (state, action: PayloadAction<string>) => {
      state.sourceIp = action.payload;
    },
    receiveTelemetry: (state, action: PayloadAction<number>) => {
      state.currentValue = action.payload;

      // Реализация "скользящего окна" (храним последние 50 точек для графиков)
      const newPoint = {
        time: new Date().toLocaleTimeString(),
        value: action.payload,
      };

      state.history.push(newPoint);
      if (state.history.length > 50) {
        state.history.shift(); // Удаляем самую старую точку
      }
    },
    addLog: (state, action: PayloadAction<string>) => {
      state.logs.push(`[${new Date().toLocaleTimeString()}] ${action.payload}`);
    },
  },
});

export const { setConnectionStatus, setSourceIp, receiveTelemetry, addLog } =
  realtimeSlice.actions;
export default realtimeSlice.reducer;
