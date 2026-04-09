// import { useEffect, useRef, useState } from "react";
// import { Client } from "@stomp/stompjs";
// import type { IMessage } from "@stomp/stompjs";

// const WEBSOCKET_URL = "https://diplomabffservice-anderm.amvera.io/ws";

// export const useStomp = (sourceIp: string) => {
//   const [value, setValue] = useState<number | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const clientRef = useRef<Client | null>(null);

//   useEffect(() => {
//     if (!sourceIp) return;

//     const client = new Client({
//       brokerURL: WEBSOCKET_URL,
//       reconnectDelay: 5000, // Авто-реконнект через 5 сек
//       heartbeatIncoming: 10000,
//       heartbeatOutgoing: 10000,

//       onConnect: () => {
//         console.log("✅ Connected to STOMP");
//         setIsConnected(true);

//         // 2. Подписываемся на топик
//         client.subscribe(
//           "/user/queue/realtime",
//           (message: IMessage) => {
//             const num = Number(message.body);
//             setValue(num);
//           },
//           {
//             sourceIp: sourceIp, // КЛЮЧЕВОЙ момент из ТЗ
//           },
//         );
//       },

//       onDisconnect: () => {
//         console.log("❌ Disconnected");
//         setIsConnected(false);
//       },

//       onStompError: (frame) => {
//         console.error("Broker Error:", frame.headers["message"]);
//       },
//     });

//     // 3. Активируем подключение
//     client.activate();
//     clientRef.current = client;

//     // 4. Очистка при размонтировании
//     return () => {
//       client.deactivate();
//       console.log("🔌 Deactivated");
//     };
//   }, [sourceIp]); // Пересоздаст подключение, если топик изменится

//   // Функция отправки сообщений (если нужно что-то слать на бэк)
//   const sendMessage = (destination: string, body: any) => {
//     const client = clientRef.current;
//     if (client && client.connected) {
//       client.publish({
//         destination,
//         body: JSON.stringify(body),
//       });
//     } else {
//       console.warn("Cannot send message: STOMP not connected");
//     }
//   };

//   return { value, isConnected, sendMessage };
// };

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import { useDispatch } from "react-redux";
import {
  setConnectionStatus,
  receiveTelemetry,
  addLog,
} from "../store/slices/realtimeSlice";

const WEBSOCKET_URL = "https://diplomabffservice-anderm.amvera.io/ws"; // Обратите внимание: wss:// вместо https://

export const useStomp = (sourceIp: string) => {
  const dispatch = useDispatch();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!sourceIp) return;

    const client = new Client({
      brokerURL: WEBSOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        dispatch(setConnectionStatus(true));

        client.subscribe(
          "/user/queue/realtime",
          (message: IMessage) => {
            const num = Number(message.body);
            if (!isNaN(num)) {
              dispatch(receiveTelemetry(num));
            }
          },
          {
            sourceIp: sourceIp, // Передача IP из ТЗ
          },
        );
      },

      onDisconnect: () => {
        dispatch(setConnectionStatus(false));
      },

      onStompError: (frame) => {
        dispatch(addLog(`Broker Error: ${frame.headers["message"]}`));
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      dispatch(setConnectionStatus(false));
    };
  }, [sourceIp, dispatch]);

  const sendMessage = (destination: string, body: any) => {
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(body),
      });
      dispatch(addLog(`Отправлено сообщение в ${destination}`));
    } else {
      dispatch(addLog("Ошибка отправки: STOMP не подключен"));
    }
  };

  return { sendMessage };
};
