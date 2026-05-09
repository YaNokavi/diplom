import { configureStore } from "@reduxjs/toolkit";
import telemetryReducer from "./slices/telemetrySlice";
import testingReducer from "./slices/testingSlice";

export const store = configureStore({
  reducer: {
    telemetry: telemetryReducer,
    testing: testingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
