import { Application } from "express-ws";
import { MILLISECONDS_IN_SECOND, now, timeout } from "../common/time";
import {
  AllWebSocketMsgs,
  ControlStartPayload,
  WebSocketMsgTypes,
} from "../common/types";
import { getVacbot } from "../utils/robovac";

const WS_PING_INTERVAL_MS = 5 * MILLISECONDS_IN_SECOND;

export const registerRobotvacRoutes = async (app: Application) => {
  app.ws("/controls", async (ws, req) => {
    const vacbot = await getVacbot();
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
            switch (p.msg.direction as ControlStartPayload["direction"]) {
              case "down":
                vacbot.run("Move", "TurnAround");
                break;
              case "up":
                vacbot.run("Move", "forward");
                break;
              case "left":
                vacbot.run("Move", "left");
                break;
              case "right":
                vacbot.run("Move", "right");
                break;
              default:
                break;
            }
            break;
          case WebSocketMsgTypes.controlStop:
            log(`stop ${p.msg.direction}`);
            vacbot.run("Move", "stop");
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
