import { Application } from "express-ws";
import { MILLISECONDS_IN_SECOND, now } from "../common/time";
import {
  AllWebSocketMsgs,
  ControlStartPayload,
  WebSocketMsgTypes,
} from "../common/types";
import {
  doCharge,
  doClean,
  doStop,
  moveForward,
  moveLeft,
  moveRight,
  moveStop,
  moveTurnAround,
} from "../utils/robovac";

const WS_PING_INTERVAL_MS = 5 * MILLISECONDS_IN_SECOND;

export const registerRobovacRoutes = async (app: Application) => {
  app.get("/robovac/clean", async (req, res) => {
    await doClean();
    res.send(
      JSON.stringify({
        done: true,
      }),
    );
  });

  app.get("/robovac/charge", async (req, res) => {
    await doCharge();
    res.send(
      JSON.stringify({
        done: true,
      }),
    );
  });

  app.get("/robovac/stop", async (req, res) => {
    await doStop();
    res.send(
      JSON.stringify({
        done: true,
      }),
    );
  });

  app.ws("/robovac/controls", async (ws, req) => {
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

    ws.on("message", async m => {
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
                await moveTurnAround();
                break;
              case "up":
                await moveForward();
                break;
              case "left":
                await moveLeft();
                break;
              case "right":
                await moveRight();
                break;
              default:
                break;
            }
            break;
          case WebSocketMsgTypes.controlStop:
            log(`stop ${p.msg.direction}`);
            await moveStop();
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
