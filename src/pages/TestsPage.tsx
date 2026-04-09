// import { useState } from "react";
// import { useStomp } from "../hooks/useStomp";

// export default function TestsPage() {
//   const [ip, setIp] = useState<string>("127.0.0.1");
//   const [submittedIp, setSubmittedIp] = useState<string>(""); // IP, по которому реально подписываемся

//   // Подключаемся и подписываемся только по submittedIp
//   const { value, isConnected, sendMessage } = useStomp(submittedIp);

//   const handleSubmit = (e: React.SubmitEvent) => {
//     e.preventDefault();
//     // При сабмите мы "фиксируем" IP, и хук пересоздаст подключение с новым sourceIp
//     setSubmittedIp(ip.trim());
//   };

//   return (
//     <>
//       <h1>Здесь будут испытания</h1>

//       <h2>Status: {isConnected ? "🟢 Online" : "🔴 Offline"}</h2>

//       {/* Пример отправки произвольного сообщения (если бэку нужно) */}
//       <button
//         onClick={() =>
//           sendMessage("/app/frontend/messages", { message: "Привет от фронта" })
//         }
//         disabled={!isConnected}
//       >
//         Отправить привет
//       </button>

//       <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
//         <input
//           type="text"
//           value={ip}
//           onChange={(e) => setIp(e.target.value)}
//           placeholder="Введите IP (sourceIp)"
//         />
//         <button type="submit">Подписаться по этому IP</button>
//       </form>

//       <p>Текущий sourceIp для подписки: {submittedIp || "(не задан)"}</p>

//       <h3>Полученное значение:</h3>
//       <pre>{value !== null ? value : "Пока ничего не пришло"}</pre>
//     </>
//   );
// }

import { useState } from "react";
import { useStomp } from "../hooks/useStomp";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../store/store"; // Укажите правильный путь к store
import { setSourceIp } from "../store/slices/realtimeSlice";

export default function TestsPage() {
  const [ipInput, setIpInput] = useState<string>("127.0.0.1");

  const dispatch = useDispatch();
  // Достаем нужные данные из глобального стейта
  const { isConnected, currentValue, sourceIp } = useSelector(
    (state: RootState) => state.realtime,
  );

  // Передаем sourceIp в хук вебсокета
  const { sendMessage } = useStomp(sourceIp || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Сохраняем IP в Redux, что автоматически вызовет переподключение в хуке useStomp
    dispatch(setSourceIp(ipInput.trim()));
  };

  return (
    <>
      <h1>Здесь будут испытания</h1>

      <h2>Status: {isConnected ? "🟢 Online" : "🔴 Offline"}</h2>

      <button
        onClick={() =>
          sendMessage("/app/frontend/messages", { message: "Привет от фронта" })
        }
        disabled={!isConnected}
      >
        Отправить привет
      </button>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          type="text"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="Введите IP (sourceIp)"
        />
        <button type="submit">Подписаться по этому IP</button>
      </form>

      <p>Текущий sourceIp для подписки: {sourceIp || "(не задан)"}</p>

      <h3>Полученное значение:</h3>
      <pre>
        {currentValue !== null ? currentValue : "Пока ничего не пришло"}
      </pre>
    </>
  );
}
