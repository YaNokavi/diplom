// ─── Enums ───────────────────────────────────────────────────────────────────

export type DeviceStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE";

export type StandStatus = "AVAILABLE" | "BUSY" | "MAINTENANCE" | null;

export type TestSessionStatus =
  | "CREATED"
  | "RUNNING"
  | "FINISHED"
  | "COMPLETED"
  | "ABORTED"
  | "FAILED";

export type TestResult = "PASS" | "FAIL";

export type ParameterType = "NUMERIC" | "STRING" | "BOOLEAN";

// ─── Device ──────────────────────────────────────────────────────────────────

export interface DeviceResponse {
  id: number;
  name: string;
  deviceType: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  status: DeviceStatus;
  createdAt: string;
}

export interface RegisterDeviceRequest {
  name: string;
  deviceType: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
}

export interface RegisterDeviceResponse {
  deviceId: number;
}

// ─── Stand ───────────────────────────────────────────────────────────────────

export interface StandResponse {
  id: number;
  name: string;
  ipAddress: string;
  port: number;
  status: StandStatus;
  attachedDeviceId: number | null;
}

// ─── Test Program ─────────────────────────────────────────────────────────────

export interface TestProgramShortResponse {
  id: number;
  name: string;
  testType: string;
  deviceType: string;
  version: number;
  description: string | null;
  isActive?: boolean;
}

export interface TestProgramParameterResponse {
  id: number;
  parameterName: string;
  parameterType: ParameterType;
  defaultValue: number | null;
  toleranceMin: number | null;
  toleranceMax: number | null;
  unit: string | null;
}

export interface TestProgramDetailResponse extends TestProgramShortResponse {
  instructionUrl: string | null;
  createdBy: string;
  durationSeconds: number;
  pollingIntervalMs: number;
  parameters: TestProgramParameterResponse[];
}

// ─── Setup ───────────────────────────────────────────────────────────────────

export interface TestingSetupResponse {
  device: DeviceResponse;
  stands: StandResponse[];          // реальное название поля с бэка
  testPrograms: TestProgramShortResponse[];
  attachedStand: StandResponse | null;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface CreateTestSessionRequest {
  testProgramId: number;
  standId: number;
  deviceId: number;
  operatorId: string;
  parameters: Record<string, number>;
}

export interface CreateTestSessionResponse {
  sessionId: number;
}

export interface TestSessionParameterResponse {
  parameterName: string;
  value: number;
}

export interface TestSessionResponse {
  id: number;
  testProgramId: number;
  standId: number;
  deviceId: number;
  operatorId: string;
  status: TestSessionStatus;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  parameters: TestSessionParameterResponse[];
}

export interface TestSessionShortResponse {
  id: number;
  testProgramId: number;
  standId: number;
  deviceId: number;
  status: TestSessionStatus;
  createdAt: string;
}

// ─── Telemetry (WebSocket) ────────────────────────────────────────────────────

export interface PlcDataMessage {
  phase: number | null;
  dutOutputVoltage: number | null;
  dutErrorFlag: number | null;
  dutHeartbeat: number | null;
  measuredAt?: string;
}
