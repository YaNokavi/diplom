import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import { useDispatch } from "react-redux";
import {
  setConnectionStatus,
  receiveTelemetry,
  addLog,
} from "../store/slices/telemetrySlice";
import type { PlcDataMessage } from "../types/api";

const WEBSOCKET_URL =
  import.meta.env.VITE_WS_URL ?? "ws://localhost/ws";

// Реальная структура сообщения с БФФ:
// { sourceIp, testType, timestamp, data: { phase, dutOutputVoltage, dutErrorFlag, dutHeartbeat } }
interface WsMessage {
  sourceIp: string;
  testType: string;
  timestamp: string;
  data: PlcDataMessage;
}

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
        dispatch(addLog(`Подключено к стенду: ${sourceIp}`));

        client.subscribe(
          "/user/queue/realtime",
          (message: IMessage) => {
            try {
              const parsed: WsMessage = JSON.parse(message.body);
              // данные телеметрии находятся в поле data
              if (parsed.data) {
                dispatch(receiveTelemetry(parsed.data));
              } else {
                // fallback: если бэк вдруг пошлёт плоский объект
                dispatch(receiveTelemetry(parsed as unknown as PlcDataMessage));
              }
            } catch {
              dispatch(addLog(`Ошибка парсинга сообщения: ${message.body}`));
            }
          },
          { sourceIp }
        );
      },

      onDisconnect: () => {
        dispatch(setConnectionStatus(false));
        dispatch(addLog("Соединение разорвано"));
      },

      onStompError: (frame) => {
        dispatch(
          addLog(`STOMP Error: ${frame.headers["message"] ?? "неизвестная ошибка"}`)
        );
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      dispatch(setConnectionStatus(false));
    };
  }, [sourceIp, dispatch]);

  const sendMessage = (destination: string, body: unknown) => {
    const client = clientRef.current;
    if (client?.connected) {
      client.publish({ destination, body: JSON.stringify(body) });
      dispatch(addLog(`Отправлено сообщение в ${destination}`));
    } else {
      dispatch(addLog("Ошибка отправки: STOMP не подключён"));
    }
  };

  return { sendMessage };
};
