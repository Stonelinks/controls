import { Application } from "express-ws";
import { MILLISECONDS_IN_SECOND, now } from "../common/time";
import { AllWebSocketMsgs, WebSocketMsgTypes } from "../common/types";

const WS_PING_INTERVAL_MS = 5 * MILLISECONDS_IN_SECOND;

export const robotvacRoutes = async (app: Application) => {
  app.ws("/controls", async (ws, req) => {
    const log = (...args: any[]) => console.log(...args);
    const err = (...args: any[]) => console.error(...args);
    const send = (m: Buffer | AllWebSocketMsgs) => {
      if (Buffer.isBuffer(m)) {
        ws.send(m);
      } else {
        const msgStr = JSON.stringify(m);
        log(`ws send ${msgStr}`);
        ws.send(msgStr);
      }
    };
    log(`ws open`);
    let lastPongTs = now();
    const pingInterval = setInterval(() => {
      const n = now();
      send({
        type: WebSocketMsgTypes.ping,
        msg: {
          ts: n,
          lastLagMs: n - lastPongTs - WS_PING_INTERVAL_MS,
        },
      });
    }, WS_PING_INTERVAL_MS);

    ws.on("close", () => {
      log(`ws close`);
      clearInterval(pingInterval);
    });

    ws.on("message", m => {
      log(`ws received ${m}`);
      try {
        const p = JSON.parse((m as unknown) as string);
        switch (p.type as WebSocketMsgTypes) {
          case WebSocketMsgTypes.pong:
            lastPongTs = p.msg.ts;
            break;
          case WebSocketMsgTypes.controlStart:
            log(`start ${p.msg.direction}`);
            break;
          case WebSocketMsgTypes.controlStop:
            log(`stop ${p.msg.direction}`);
            break;
          default:
            break;
        }
      } catch (e) {
        err("received message that isn't JSON?");
        err(e.stack);
      }
    });
  });
};
