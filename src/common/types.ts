import { JsonObject } from "./json";

export interface Config extends JsonObject {}

export enum WebSocketMsgTypes {
  ping = "ping",
  pong = "pong",
  controlStart = "start",
  controlStop = "stop",
}

export interface PingPayload {
  ts: number;
  lastLagMs?: number;
}

export interface PongPayload {
  ts: number;
}

export interface ControlStartPayload {
  direction: "left" | "right" | "up" | "down";
}

export interface ControlStopPayload {
  direction: "left" | "right" | "up" | "down";
}

type AllWebSocketMsgPayloads =
  | PingPayload
  | PongPayload
  | ControlStartPayload
  | ControlStopPayload;

export interface WebSocketMsg {
  type: WebSocketMsgTypes;
  msg?: AllWebSocketMsgPayloads;
}

export interface PingWebSocketMsg extends WebSocketMsg {
  type: WebSocketMsgTypes.ping;
  msg: PingPayload;
}

export interface PongWebSocketMsg extends WebSocketMsg {
  type: WebSocketMsgTypes.pong;
  msg: PongPayload;
}

export interface ControlStartWebSocketMsg extends WebSocketMsg {
  type: WebSocketMsgTypes.controlStart;
  msg: ControlStartPayload;
}

export interface ControlStopWebSocketMsg extends WebSocketMsg {
  type: WebSocketMsgTypes.controlStop;
  msg: ControlStopPayload;
}

export type AllWebSocketMsgs =
  | PingWebSocketMsg
  | PongWebSocketMsg
  | ControlStartWebSocketMsg
  | ControlStopWebSocketMsg;
