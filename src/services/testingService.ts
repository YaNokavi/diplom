import axiosInstance from "../api/axiosInstance";
import type {
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  TestingSetupResponse,
  TestProgramDetailResponse,
  CreateTestSessionRequest,
  CreateTestSessionResponse,
  TestSessionResponse,
  TestSessionShortResponse,
} from "../types/api";

const BASE = "/api/v1/testing";

// ─── Device ──────────────────────────────────────────────────────────────────

export const registerDevice = async (
  body: RegisterDeviceRequest
): Promise<RegisterDeviceResponse> => {
  const { data } = await axiosInstance.post<RegisterDeviceResponse>(
    `${BASE}/devices`,
    body
  );
  return data;
};

// ─── Setup ───────────────────────────────────────────────────────────────────

export const getTestingSetup = async (
  deviceId: number
): Promise<TestingSetupResponse> => {
  const { data } = await axiosInstance.get<TestingSetupResponse>(
    `${BASE}/setup`,
    { params: { deviceId } }
  );
  return data;
};

// ─── Stand ───────────────────────────────────────────────────────────────────

export const attachDeviceToStand = async (
  standId: number,
  deviceId: number
): Promise<void> => {
  await axiosInstance.post(`${BASE}/stands/${standId}/attach-device`, {
    deviceId,
  });
};

// ─── Test Program ─────────────────────────────────────────────────────────────

export const getTestProgram = async (
  programId: number
): Promise<TestProgramDetailResponse> => {
  const { data } = await axiosInstance.get<TestProgramDetailResponse>(
    `${BASE}/programs/${programId}`
  );
  return data;
};

// ─── Session ─────────────────────────────────────────────────────────────────

export const createTestSession = async (
  body: CreateTestSessionRequest
): Promise<CreateTestSessionResponse> => {
  const { data } = await axiosInstance.post<CreateTestSessionResponse>(
    `${BASE}/sessions`,
    body
  );
  return data;
};

export const startTestSession = async (
  sessionId: number
): Promise<TestSessionResponse> => {
  const { data } = await axiosInstance.post<TestSessionResponse>(
    `${BASE}/sessions/${sessionId}/start`
  );
  return data;
};

export const abortTestSession = async (
  sessionId: number
): Promise<TestSessionResponse> => {
  const { data } = await axiosInstance.post<TestSessionResponse>(
    `${BASE}/sessions/${sessionId}/abort`
  );
  return data;
};

export const getTestSession = async (
  sessionId: number
): Promise<TestSessionResponse> => {
  const { data } = await axiosInstance.get<TestSessionResponse>(
    `${BASE}/sessions/${sessionId}`
  );
  return data;
};

export const getTestSessions = async (params?: {
  standId?: number;
  testProgramId?: number;
  status?: string;
}): Promise<TestSessionShortResponse[]> => {
  const { data } = await axiosInstance.get<TestSessionShortResponse[]>(
    `${BASE}/sessions`,
    { params }
  );
  return data;
};

// ─── Report ───────────────────────────────────────────────────────────────────

export const downloadDeviceReport = async (
  deviceId: number
): Promise<void> => {
  const response = await axiosInstance.get(
    `${BASE}/devices/${deviceId}/report`,
    { responseType: "blob" }
  );

  const contentDisposition: string =
    response.headers["content-disposition"] ?? "";
  const match = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*)\1/);
  const filename = match?.[2] ?? `device-${deviceId}-report.docx`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
