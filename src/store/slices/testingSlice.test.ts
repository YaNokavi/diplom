import { describe, it, expect } from "vitest";
import reducer, {
  nextStep,
  prevStep,
  deviceRegistered,
  programSelected,
  setSessionParameter,
  resetWizard,
} from "./testingSlice";
import type { DeviceResponse, TestProgramDetailResponse } from "../../types/api";

const mockDevice: DeviceResponse = {
  id: 1,
  name: "ПЛК-001",
  deviceType: "PLC",
  model: "ОВЕН",
  serialNumber: "SN-001",
  firmwareVersion: "1.0.0",
  status: "AVAILABLE",
  createdAt: "2026-01-01T00:00:00Z",
};

const mockProgram: TestProgramDetailResponse = {
  id: 1,
  name: "Тестовая программа",
  description: "",
  testType: "VOLTAGE_VARIATION",
  deviceType: "PLC",
  version: 1,
  parameters: [
    { parameterName: "voltage", unit: "V", defaultValue: 220, minValue: 0, maxValue: 400 },
    { parameterName: "duration", unit: "s", defaultValue: 10, minValue: 1, maxValue: 3600 },
  ],
};

describe("testingSlice", () => {
  it("Тест 5: nextStep не выходит за границу шага 5", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    // промотаем до шага 5
    for (let i = 0; i < 10; i++) {
      state = reducer(state, nextStep());
    }
    expect(state.currentStep).toBe(5);
  });

  it("Тест 6: prevStep не уходит ниже шага 1", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    for (let i = 0; i < 5; i++) {
      state = reducer(state, prevStep());
    }
    expect(state.currentStep).toBe(1);
  });

  it("Тест 7: programSelected автоматически заполняет sessionParameters значениями по умолчанию", () => {
    let state = reducer(undefined, deviceRegistered({ deviceId: 1, device: mockDevice }));
    state = reducer(state, programSelected({ program: mockProgram }));

    expect(state.selectedProgramId).toBe(1);
    expect(state.sessionParameters["voltage"]).toBe(220);
    expect(state.sessionParameters["duration"]).toBe(10);
  });

  it("Тест 8: resetWizard возвращает полное начальное состояние", () => {
    let state = reducer(undefined, deviceRegistered({ deviceId: 1, device: mockDevice }));
    state = reducer(state, programSelected({ program: mockProgram }));
    state = reducer(state, setSessionParameter({ name: "voltage", value: 380 }));
    state = reducer(state, nextStep());
    state = reducer(state, resetWizard());

    expect(state.currentStep).toBe(1);
    expect(state.registeredDeviceId).toBeNull();
    expect(state.selectedProgramId).toBeNull();
    expect(state.sessionParameters).toEqual({});
    expect(state.error).toBeNull();
  });
});
