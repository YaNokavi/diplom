import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DeviceResponse,
  StandResponse,
  TestProgramDetailResponse,
  TestSessionResponse,
} from "../../types/api";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

interface TestingState {
  // Wizard navigation
  currentStep: WizardStep;

  // Step 1 — registered device
  registeredDeviceId: number | null;
  device: DeviceResponse | null;

  // Step 3 — stand selection
  selectedStandId: number | null;
  selectedStand: StandResponse | null;

  // Step 4 — program + session
  selectedProgramId: number | null;
  selectedProgram: TestProgramDetailResponse | null;
  sessionParameters: Record<string, number>;
  activeSessionId: number | null;
  activeSession: TestSessionResponse | null;

  // Global error message
  error: string | null;
}

const initialState: TestingState = {
  currentStep: 1,
  registeredDeviceId: null,
  device: null,
  selectedStandId: null,
  selectedStand: null,
  selectedProgramId: null,
  selectedProgram: null,
  sessionParameters: {},
  activeSessionId: null,
  activeSession: null,
  error: null,
};

export const testingSlice = createSlice({
  name: "testing",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<WizardStep>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < 5) {
        state.currentStep = (state.currentStep + 1) as WizardStep;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep = (state.currentStep - 1) as WizardStep;
      }
    },
    deviceRegistered: (
      state,
      action: PayloadAction<{ deviceId: number; device: DeviceResponse }>
    ) => {
      state.registeredDeviceId = action.payload.deviceId;
      state.device = action.payload.device;
      state.error = null;
    },
    standSelected: (
      state,
      action: PayloadAction<{ stand: StandResponse }>
    ) => {
      state.selectedStandId = action.payload.stand.id;
      state.selectedStand = action.payload.stand;
      state.error = null;
    },
    programSelected: (
      state,
      action: PayloadAction<{ program: TestProgramDetailResponse }>
    ) => {
      state.selectedProgramId = action.payload.program.id;
      state.selectedProgram = action.payload.program;
      // Pre-fill parameters with default values from program
      const params: Record<string, number> = {};
      for (const p of action.payload.program.parameters) {
        if (p.defaultValue !== null) {
          params[p.parameterName] = p.defaultValue;
        }
      }
      state.sessionParameters = params;
      state.error = null;
    },
    setSessionParameter: (
      state,
      action: PayloadAction<{ name: string; value: number }>
    ) => {
      state.sessionParameters[action.payload.name] = action.payload.value;
    },
    sessionCreated: (state, action: PayloadAction<number>) => {
      state.activeSessionId = action.payload;
      state.error = null;
    },
    sessionUpdated: (state, action: PayloadAction<TestSessionResponse>) => {
      state.activeSession = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetWizard: () => initialState,
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  deviceRegistered,
  standSelected,
  programSelected,
  setSessionParameter,
  sessionCreated,
  sessionUpdated,
  setError,
  resetWizard,
} = testingSlice.actions;
export default testingSlice.reducer;
