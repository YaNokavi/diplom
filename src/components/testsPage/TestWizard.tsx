import { useState } from "react";
import { useSelector } from "react-redux";

import TelemetryChart from "./TelemetryChart";
import type { RootState } from "../../store/store";
import { generateDocxReport } from "../../utils/reportGenerator";

// Моковые данные шаблонов из вашего index.html
const TEMPLATES: Record<string, any> = {
  sensor: {
    title: "Датчик давления",
    gost: "ГОСТ 34.602-2020",
    steps: [
      "Внешний осмотр",
      "Проверка герметичности",
      "Тест выходного сигнала",
    ],
  },
  psu: {
    title: "Блок питания 24V",
    gost: "ГОСТ Р 52931",
    steps: [
      "Внешний осмотр",
      "Холостой ход",
      "Номинальная нагрузка",
      "Защита от КЗ",
    ],
  },
  plc: {
    title: "ПЛК",
    gost: "ГОСТ IEC 61131-2",
    steps: [
      "Внешний осмотр",
      "Проверка связи",
      "Тест дискретных IO",
      "Стресс-тест CPU",
    ],
  },
};

export default function TestWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    template: "",
    device: "",
    serial: "",
  });

  // Достаем данные из Redux для шагов 3 и 4
  const { isConnected, currentValue, history } = useSelector(
    (state: RootState) => state.realtime,
  );

  const handleNext = () => setStep((p) => Math.min(p + 1, 5));
  const handlePrev = () => setStep((p) => Math.max(p - 1, 1));

  const isNextDisabled = () => {
    if (step === 1 && (!formData.template || !formData.device)) return true;
    if (step === 3 && !isConnected) return true; // Ждем подключения к стенду
    return false;
  };

  const handleGenerateReport = async () => {
    try {
      await generateDocxReport({
        device: formData.device,
        serial: formData.serial || "Без номера",
        templateTitle:
          TEMPLATES[formData.template]?.title || "Неизвестный шаблон",
        gost: TEMPLATES[formData.template]?.gost || "Без ГОСТа",
        history: history, // из useSelector(state => state.realtime.history)
        status: "ГОДЕН", // В будущем можно вычислять динамически
      });
      alert("Отчет успешно сгенерирован!");
    } catch (error) {
      console.error("Ошибка при создании отчета:", error);
      alert("Не удалось сгенерировать отчет");
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        border: "1px solid #e8e8e8",
      }}
    >
      {/* Прогресс-бар */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 30,
          position: "relative",
        }}
      >
        {[1, 2, 3, 4, 5].map((num) => (
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
                background: step >= num ? "#2180a0" : "#fff",
                color: step >= num ? "#fff" : "#a7a9a9",
                border: `2px solid ${step >= num ? "#2180a0" : "#e8e8e8"}`,
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontSize: 12,
                color: step >= num ? "#1f2121" : "#a7a9a9",
              }}
            >
              {
                ["Устройство", "Инструкция", "Стенд", "Испытание", "Итоги"][
                  num - 1
                ]
              }
            </div>
          </div>
        ))}
      </div>

      {/* Шаг 1: Выбор устройства */}
      {step === 1 && (
        <div>
          <h3>1. Выбор устройства и программы</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
              Программа испытаний (ГОСТ)
            </label>
            <select
              value={formData.template}
              onChange={(e) =>
                setFormData({ ...formData, template: e.target.value })
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #e8e8e8",
              }}
            >
              <option value="">-- Выберите программу --</option>
              <option value="sensor">Датчик давления (ГОСТ 34.602-2020)</option>
              <option value="psu">Блок питания (ГОСТ Р 52931)</option>
              <option value="plc">Контроллер ПЛК (ГОСТ IEC 61131-2)</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
              Серийный номер устройства
            </label>
            <input
              type="text"
              placeholder="Например: SN-2025-001"
              value={formData.serial}
              onChange={(e) =>
                setFormData({ ...formData, serial: e.target.value })
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #e8e8e8",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            {["sensor", "psu", "plc"].map((dev) => (
              <div
                key={dev}
                onClick={() => setFormData({ ...formData, device: dev })}
                style={{
                  flex: 1,
                  padding: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 8,
                  border: `2px solid ${formData.device === dev ? "#2180a0" : "#e8e8e8"}`,
                  background:
                    formData.device === dev
                      ? "rgba(33, 128, 160, 0.1)"
                      : "#fcfcf9",
                }}
              >
                <strong>{dev.toUpperCase()}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 2: Инструкции */}
      {step === 2 && formData.template && (
        <div>
          <h3>2. Инструкция по проведению</h3>
          <div
            style={{
              background: "#fcfcf9",
              borderLeft: "4px solid #2180a0",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <h4>{TEMPLATES[formData.template].title}</h4>
            <p>
              <strong>Стандарт:</strong> {TEMPLATES[formData.template].gost}
            </p>
            <ul>
              {TEMPLATES[formData.template].steps.map(
                (s: string, i: number) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {s}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Шаг 3: Подключение к стенду */}
      {step === 3 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <h3>3. Подключение к стенду</h3>
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 16px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              background: isConnected
                ? "rgba(34, 194, 93, 0.1)"
                : "rgba(230, 129, 97, 0.1)",
              color: isConnected ? "#22c25d" : "#e68161",
            }}
          >
            {isConnected ? "✓" : "⚡"}
          </div>
          <h4>
            {isConnected
              ? "Соединение установлено"
              : "Ожидание подключения (введите IP на панели)..."}
          </h4>
        </div>
      )}

      {/* Шаг 4: Сбор данных */}
      {step === 4 && (
        <div>
          <h3>4. Сбор телеметрии</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: "#fcfcf9",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#a7a9a9" }}>
                Текущее значение
              </div>
              <div
                style={{ fontSize: 24, fontWeight: "bold", color: "#2180a0" }}
              >
                {currentValue ?? "--"} V
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#a7a9a9" }}>
                Статус параметров
              </div>
              <div style={{ color: "#22c25d", fontWeight: "bold" }}>
                В норме
              </div>
            </div>
          </div>
          <TelemetryChart />
        </div>
      )}

      {/* Шаг 5: Итоги */}
      {step === 5 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 64, color: "#22c25d", marginBottom: 16 }}>
            ✓
          </div>
          <h3>Испытание успешно завершено</h3>
          <p style={{ color: "#626c71" }}>
            Устройство: {formData.device.toUpperCase()} ({formData.serial})
          </p>
          <button
            onClick={handleGenerateReport}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              background: "#2180a0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Сгенерировать отчет (DOCX)
          </button>
        </div>
      )}

      {/* Навигация */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
          paddingTop: 20,
          borderTop: "1px solid #e8e8e8",
        }}
      >
        <button
          onClick={handlePrev}
          disabled={step === 1}
          style={{
            padding: "10px 20px",
            background: "#e8e8e8",
            border: "none",
            borderRadius: 8,
            cursor: step === 1 ? "not-allowed" : "pointer",
          }}
        >
          Назад
        </button>
        {step < 5 && (
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            style={{
              padding: "10px 20px",
              background: isNextDisabled() ? "#a7a9a9" : "#2180a0",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: isNextDisabled() ? "not-allowed" : "pointer",
            }}
          >
            Далее
          </button>
        )}
      </div>
    </div>
  );
}
