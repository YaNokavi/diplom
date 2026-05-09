import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  deviceRegistered,
  standSelected,
  programSelected,
  setSessionParameter,
  sessionCreated,
  sessionUpdated,
  setError,
  nextStep,
  prevStep,
  resetWizard,
} from "../../store/slices/testingSlice";
import {
  setSourceIp,
  resetTelemetry,
} from "../../store/slices/telemetrySlice";
import { useStomp } from "../../hooks/useStomp";
import TelemetryChart from "./TelemetryChart";
import type {
  StandResponse,
  TestProgramShortResponse,
  TestProgramDetailResponse,
  TestingSetupResponse,
} from "../../types/api";
import {
  registerDevice,
  getTestingSetup,
  attachDeviceToStand,
  getTestProgram,
  createTestSession,
  startTestSession,
  abortTestSession,
  downloadDeviceReport,
} from "../../services/testingService";

const STEP_LABELS = [
  "Устройство",
  "Стенд",
  "Программа",
  "Испытание",
  "Итоги",
];

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, position: "relative" }}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const active = step >= num;
        return (
          <div key={num} style={{ textAlign: "center", zIndex: 2, flex: 1 }}>
            <div
              style={{
                width: 40,
                height: 40,
                margin: "0 auto 8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                background: active ? "#2180a0" : "#fff",
                color: active ? "#fff" : "#a7a9a9",
                border: `2px solid ${active ? "#2180a0" : "#e8e8e8"}`,
                transition: "all 0.3s",
              }}
            >
              {num}
            </div>
            <div style={{ fontSize: 12, color: active ? "#1f2121" : "#a7a9a9" }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fcfcf9", borderLeft: "4px solid #2180a0", padding: 16, borderRadius: 8, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 }}>
      ⚠️ {message}
    </div>
  );
}

function inputStyle(): React.CSSProperties {
  return { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e8e8e8", fontSize: 14, boxSizing: "border-box" };
}

// ────────────────────────────── Step 1: Register device + load setup

function Step1({
  onSetupLoaded,
}: {
  onSetupLoaded: (setup: TestingSetupResponse) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((s: RootState) => s.testing);

  const [form, setForm] = useState({
    name: "",
    deviceType: "PLC",
    model: "",
    serialNumber: "",
    firmwareVersion: "1.0.0",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!form.name || !form.serialNumber) {
      dispatch(setError("Название и серийный номер обязательны"));
      return;
    }
    setLoading(true);
    dispatch(setError(null));
    try {
      const { deviceId } = await registerDevice(form);
      const setup = await getTestingSetup(deviceId);
      dispatch(deviceRegistered({ deviceId, device: setup.device }));
      onSetupLoaded(setup);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка регистрации устройства";
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  }, [form, dispatch, onSetupLoaded]);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>1. Регистрация устройства</h3>
      {error && <ErrorBanner message={error} />}
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#626c71" }}>Название *</label>
          <input style={inputStyle()} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ИУТ-001 ПЛК" />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#626c71" }}>Тип устройства</label>
          <select style={inputStyle()} value={form.deviceType} onChange={e => setForm({ ...form, deviceType: e.target.value })}>
            <option value="PLC">PLC</option>
            <option value="SENSOR">SENSOR</option>
            <option value="PSU">PSU</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#626c71" }}>Модель</label>
          <input style={inputStyle()} value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="ОВЕН ПЛК" />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#626c71" }}>Серийный номер *</label>
          <input style={inputStyle()} value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} placeholder="PLC-VV-001" />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#626c71" }}>Версия прошивки</label>
          <input style={inputStyle()} value={form.firmwareVersion} onChange={e => setForm({ ...form, firmwareVersion: e.target.value })} placeholder="1.0.0" />
        </div>
      </div>
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{ marginTop: 20, padding: "10px 24px", background: loading ? "#a7a9a9" : "#2180a0", color: "#fff", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 14 }}
      >
        {loading ? "Регистрация..." : "Зарегистрировать устройство"}
      </button>
    </div>
  );
}

// ────────────────────────────── Step 2: Stand selection + attach

function Step2({
  stands,
  onAttached,
}: {
  stands: StandResponse[];
  onAttached: (stand: StandResponse) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { registeredDeviceId, selectedStandId, error } = useSelector(
    (s: RootState) => s.testing
  );
  const [loading, setLoading] = useState(false);

  const handleAttach = async () => {
    if (!selectedStandId || !registeredDeviceId) return;
    setLoading(true);
    dispatch(setError(null));
    try {
      await attachDeviceToStand(selectedStandId, registeredDeviceId);
      const stand = stands.find(s => s.id === selectedStandId)!;
      onAttached(stand);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка привязки к стенду";
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  if (stands.length === 0) {
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>2. Выбор стенда</h3>
        <Card><p style={{ margin: 0, color: "#626c71" }}>Доступных стендов нет. Обратитесь к администратору.</p></Card>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>2. Выбор стенда</h3>
      {error && <ErrorBanner message={error} />}
      <div style={{ display: "grid", gap: 10 }}>
        {stands.map(stand => (
          <div
            key={stand.id}
            onClick={() => dispatch(standSelected({ stand }))}
            style={{
              padding: 14,
              borderRadius: 8,
              border: `2px solid ${selectedStandId === stand.id ? "#2180a0" : "#e8e8e8"}`,
              background: selectedStandId === stand.id ? "rgba(33,128,160,0.07)" : "#fcfcf9",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>{stand.name}</div>
            <div style={{ fontSize: 13, color: "#626c71" }}>
              {stand.ipAddress}:{stand.port} &nbsp;·&nbsp;
              <span style={{ color: stand.status === "AVAILABLE" ? "#22c25d" : "#e68161", fontWeight: 500 }}>
                {stand.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleAttach}
        disabled={!selectedStandId || loading}
        style={{ marginTop: 20, padding: "10px 24px", background: (!selectedStandId || loading) ? "#a7a9a9" : "#2180a0", color: "#fff", border: "none", borderRadius: 8, cursor: (!selectedStandId || loading) ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: 14 }}
      >
        {loading ? "Привязка..." : "Привязать устройство"}
      </button>
    </div>
  );
}

// ────────────────────────────── Step 3: Program selection

function Step3({
  programs,
  onProgramLoaded,
}: {
  programs: TestProgramShortResponse[];
  onProgramLoaded: (program: TestProgramDetailResponse) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProgramId, error } = useSelector((s: RootState) => s.testing);
  const [loading, setLoading] = useState(false);

  const handleSelectProgram = async (programId: number) => {
    setLoading(true);
    dispatch(setError(null));
    try {
      const detail = await getTestProgram(programId);
      dispatch(programSelected({ program: detail }));
      onProgramLoaded(detail);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки программы";
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>3. Выбор программы испытаний</h3>
      {error && <ErrorBanner message={error} />}
      {loading && <div style={{ color: "#626c71", marginBottom: 12 }}>Загрузка программы...</div>}
      <div style={{ display: "grid", gap: 10 }}>
        {programs.map(prog => (
          <div
            key={prog.id}
            onClick={() => !loading && handleSelectProgram(prog.id)}
            style={{
              padding: 14,
              borderRadius: 8,
              border: `2px solid ${selectedProgramId === prog.id ? "#2180a0" : "#e8e8e8"}`,
              background: selectedProgramId === prog.id ? "rgba(33,128,160,0.07)" : "#fcfcf9",
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>{prog.name}</div>
            <div style={{ fontSize: 13, color: "#626c71" }}>
              {prog.testType} · v{prog.version} ·
              <span style={{ marginLeft: 4, color: prog.isActive ? "#22c25d" : "#a7a9a9" }}>
                {prog.isActive ? "Активна" : "Неактивна"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────── Step 4: Run test

function Step4() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    registeredDeviceId,
    selectedStandId,
    selectedProgramId,
    selectedProgram,
    sessionParameters,
    activeSessionId,
    activeSession,
    error,
  } = useSelector((s: RootState) => s.testing);
  const { isConnected, latest } = useSelector((s: RootState) => s.telemetry);
  const [loading, setLoading] = useState(false);

  // WS connects when sourceIp is set in store (done on stand attach)
  useStomp(
    useSelector((s: RootState) => s.telemetry.sourceIp) ?? ""
  );

  const handleCreateAndStart = async () => {
    if (!registeredDeviceId || !selectedStandId || !selectedProgramId) return;
    setLoading(true);
    dispatch(setError(null));
    try {
      const { sessionId } = await createTestSession({
        testProgramId: selectedProgramId,
        standId: selectedStandId,
        deviceId: registeredDeviceId,
        operatorId: "operator-1",
        parameters: sessionParameters,
      });
      dispatch(sessionCreated(sessionId));
      const session = await startTestSession(sessionId);
      dispatch(sessionUpdated(session));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка пуска испытания";
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleAbort = async () => {
    if (!activeSessionId) return;
    setLoading(true);
    try {
      const session = await abortTestSession(activeSessionId);
      dispatch(sessionUpdated(session));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка остановки";
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  const isRunning = activeSession?.status === "RUNNING";
  const isFinished = ["COMPLETED", "ABORTED", "FAILED", "FINISHED"].includes(
    activeSession?.status ?? ""
  );

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>4. Проведение испытания</h3>
      {error && <ErrorBanner message={error} />}

      {/* Параметры сессии */}
      {selectedProgram && (
        <Card>
          <div style={{ fontWeight: "bold", marginBottom: 10 }}>Параметры испытания</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {selectedProgram.parameters.map(param => (
              <div key={param.parameterName}>
                <label style={{ display: "block", fontSize: 12, color: "#626c71", marginBottom: 3 }}>
                  {param.parameterName}{param.unit ? ` (${param.unit})` : ""}
                </label>
                <input
                  type="number"
                  style={inputStyle()}
                  value={sessionParameters[param.parameterName] ?? param.defaultValue ?? ""}
                  onChange={e =>
                    dispatch(
                      setSessionParameter({
                        name: param.parameterName,
                        value: Number(e.target.value),
                      })
                    )
                  }
                  disabled={isRunning}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Статус сессии */}
      {activeSession && (
        <Card>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "#a7a9a9" }}>Статус сессии</div>
              <div style={{ fontWeight: "bold", color: statusColor(activeSession.status) }}>
                {activeSession.status}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#a7a9a9" }}>ID сессии</div>
              <div style={{ fontWeight: "bold" }}>#{activeSession.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#a7a9a9" }}>WebSocket</div>
              <div style={{ fontWeight: "bold", color: isConnected ? "#22c25d" : "#e68161" }}>
                {isConnected ? "Связан" : "Нет связи"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Live метрики */}
      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {([
            { label: "Напряжение", value: latest.dutOutputVoltage, unit: "V" },
            { label: "Фаза", value: latest.phase, unit: "" },
            { label: "Heartbeat", value: latest.dutHeartbeat, unit: "" },
            { label: "Ошибка", value: latest.dutErrorFlag, unit: "", warn: true },
          ] as const).map(({ label, value, unit, warn }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 8, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#a7a9a9", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: warn && value ? "#e68161" : "#2180a0" }}>
                {value !== null && value !== undefined ? `${value}${unit ? ` ${unit}` : ""}` : "—"}
              </div>
            </div>
          ))}
        </div>
      )}

      <TelemetryChart />

      {/* Кнопки управления */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {!activeSessionId && (
          <button
            onClick={handleCreateAndStart}
            disabled={loading || !selectedProgramId}
            style={{ padding: "10px 24px", background: loading ? "#a7a9a9" : "#2180a0", color: "#fff", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontWeight: "bold" }}
          >
            {loading ? "Запуск..." : "Запустить испытание"}
          </button>
        )}
        {isRunning && (
          <button
            onClick={handleAbort}
            disabled={loading}
            style={{ padding: "10px 24px", background: "#e68161", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
          >
            Остановить
          </button>
        )}
        {isFinished && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: statusColor(activeSession!.status), fontWeight: "bold" }}>
            ✓ Сессия завершена: {activeSession!.status}
          </div>
        )}
      </div>
    </div>
  );
}

function statusColor(status: string) {
  if (status === "RUNNING") return "#2180a0";
  if (status === "COMPLETED") return "#22c25d";
  if (status === "ABORTED" || status === "FAILED") return "#e68161";
  return "#626c71";
}

// ────────────────────────────── Step 5: Results + report

function Step5() {
  const dispatch = useDispatch<AppDispatch>();
  const { registeredDeviceId, activeSession, device } = useSelector(
    (s: RootState) => s.testing
  );
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!registeredDeviceId) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadDeviceReport(registeredDeviceId);
    } catch {
      setDownloadError("Не удалось скачать отчёт. Попробуйте позже.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    dispatch(resetWizard());
    dispatch(resetTelemetry());
  };

  const resultColor =
    activeSession?.status === "COMPLETED" ? "#22c25d" :
    activeSession?.status === "FAILED" ? "#e68161" : "#a7a9a9";

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>
        {activeSession?.status === "COMPLETED" ? "✅" :
         activeSession?.status === "FAILED" ? "❌" : "⏳"}
      </div>
      <h3 style={{ color: resultColor }}>
        {activeSession?.status === "COMPLETED" && "Испытание успешно завершено"}
        {activeSession?.status === "FAILED" && "Испытание завершено с ошибкой"}
        {activeSession?.status === "ABORTED" && "Испытание прервано"}
        {!activeSession && "Ожидание завершения..."}
      </h3>

      {device && (
        <div style={{ color: "#626c71", marginBottom: 8 }}>
          {device.name} · {device.serialNumber}
        </div>
      )}
      {activeSession && (
        <div style={{ color: "#626c71", marginBottom: 20 }}>
          Сессия #{activeSession.id}
        </div>
      )}

      {downloadError && <ErrorBanner message={downloadError} />}

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={handleDownload}
          disabled={downloading || !registeredDeviceId}
          style={{ padding: "10px 24px", background: downloading ? "#a7a9a9" : "#2180a0", color: "#fff", border: "none", borderRadius: 8, cursor: downloading ? "not-allowed" : "pointer", fontWeight: "bold" }}
        >
          {downloading ? "Скачивание..." : "Скачать отчёт (.docx)"}
        </button>
        <button
          onClick={handleReset}
          style={{ padding: "10px 24px", background: "#e8e8e8", color: "#1f2121", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
        >
          Новое испытание
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────── Root Wizard

export default function TestWizard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentStep, selectedStandId, selectedProgramId } = useSelector(
    (s: RootState) => s.testing
  );

  const [setup, setSetup] = useState<TestingSetupResponse | null>(null);

  const handleSetupLoaded = useCallback(
    (loadedSetup: TestingSetupResponse) => {
      setSetup(loadedSetup);
      dispatch(nextStep());
    },
    [dispatch]
  );

  const handleStandAttached = useCallback(
    (stand: StandResponse) => {
      dispatch(setSourceIp(stand.ipAddress));
      dispatch(nextStep());
    },
    [dispatch]
  );

  const handleProgramLoaded = useCallback(() => {
    // programSelected is already dispatched inside Step3
    dispatch(nextStep());
  }, [dispatch]);

  const canGoNext = () => {
    if (currentStep === 2 && !selectedStandId) return false;
    if (currentStep === 3 && !selectedProgramId) return false;
    return true;
  };

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        background: "#fff",
        padding: 28,
        borderRadius: 12,
        border: "1px solid #e8e8e8",
      }}
    >
      <StepIndicator step={currentStep} />

      {currentStep === 1 && <Step1 onSetupLoaded={handleSetupLoaded} />}
      {currentStep === 2 && setup && (
        <Step2 stands={setup.availableStands} onAttached={handleStandAttached} />
      )}
      {currentStep === 3 && setup && (
        <Step3
          programs={setup.testPrograms}
          onProgramLoaded={handleProgramLoaded}
        />
      )}
      {currentStep === 4 && <Step4 />}
      {currentStep === 5 && <Step5 />}

      {/* Navigation footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 36,
          paddingTop: 20,
          borderTop: "1px solid #e8e8e8",
        }}
      >
        <button
          onClick={() => dispatch(prevStep())}
          disabled={currentStep === 1}
          style={{
            padding: "10px 20px",
            background: "#e8e8e8",
            border: "none",
            borderRadius: 8,
            cursor: currentStep === 1 ? "not-allowed" : "pointer",
            opacity: currentStep === 1 ? 0.5 : 1,
          }}
        >
          Назад
        </button>

        {currentStep < 5 && currentStep > 1 && (
          <button
            onClick={() => dispatch(nextStep())}
            disabled={!canGoNext()}
            style={{
              padding: "10px 20px",
              background: canGoNext() ? "#2180a0" : "#a7a9a9",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: canGoNext() ? "pointer" : "not-allowed",
            }}
          >
            Далее
          </button>
        )}

        {currentStep === 4 && (
          <button
            onClick={() => dispatch(nextStep())}
            style={{
              padding: "10px 20px",
              background: "#22c25d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Перейти к итогам
          </button>
        )}
      </div>
    </div>
  );
}
