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
              const parsed: PlcDataMessage = JSON.parse(message.body);
              dispatch(receiveTelemetry(parsed));
            } catch {
              // fallback: если бэк пошлёт простое число (legacy)
              const num = Number(message.body);
              if (!isNaN(num)) {
                dispatch(
                  receiveTelemetry({
                    dutOutputVoltage: num,
                    phase: null,
                    dutErrorFlag: null,
                    dutHeartbeat: null,
                  })
                );
              } else {
                dispatch(addLog(`Неизвестный формат сообщения: ${message.body}`));
              }
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
