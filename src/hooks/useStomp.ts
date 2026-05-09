import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import { useDispatch } from "react-redux";
import {
  setConnectionStatus,
  receiveTelemetry,
  addLog,
} from "../store/slices/telemetrySlice";

const WEBSOCKET_URL = "wss://diplomabffservice-anderm.amvera.io/ws";

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
            sourceIp: sourceIp,
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
