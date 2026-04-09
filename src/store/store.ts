import { configureStore } from "@reduxjs/toolkit";
import realtimeReducer from "./slices/realtimeSlice";

export const store = configureStore({
  reducer: {
    realtime: realtimeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
