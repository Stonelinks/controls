import * as mousetrap from "mousetrap";
import React from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
} from "react-icons/fa";
import { now } from "../common/time";
import {
  AllWebSocketMsgs,
  PingPayload,
  WebSocketMsg,
  WebSocketMsgTypes,
} from "../common/types";
import { WS_BASE_URL } from "../utils/api";

interface OwnProps {}

type Props = OwnProps;

interface State {
  lastLagMs: number;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

type KeyOrMouseEvent = any;
// | KeyboardEvent
// TODO why doesn't below work?
// | MouseEvent<HTMLButtonElement, MouseEvent>;

class RobovacControl extends React.Component<Props, State> {
  leftStart: (e: KeyOrMouseEvent) => void;
  leftEnd: (e: KeyOrMouseEvent) => void;
  rightStart: (e: KeyOrMouseEvent) => void;
  rightEnd: (e: KeyOrMouseEvent) => void;
  upStart: (e: KeyOrMouseEvent) => void;
  upEnd: (e: KeyOrMouseEvent) => void;
  downStart: (e: KeyOrMouseEvent) => void;
  downEnd: (e: KeyOrMouseEvent) => void;

  state = {
    lastLagMs: 0,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor(props: Props) {
    super(props);

    this.leftStart = this.makeKeyDownHandler("left");
    this.leftEnd = this.makeKeyUpHandler("left");
    this.rightStart = this.makeKeyDownHandler("right");
    this.rightEnd = this.makeKeyUpHandler("right");
    this.upStart = this.makeKeyDownHandler("up");
    this.upEnd = this.makeKeyUpHandler("up");
    this.downStart = this.makeKeyDownHandler("down");
    this.downEnd = this.makeKeyUpHandler("down");
  }

  makeKeyDownHandler = (direction: "left" | "right" | "up" | "down") => {
    return (e: KeyOrMouseEvent) => {
      e.preventDefault();
      if (!this.state[direction]) {
        console.log("start", direction);
        this.sendMessage({
          type: WebSocketMsgTypes.controlStart,
          msg: { direction },
        });
        (this.setState as any)({ [direction]: true });
      }
    };
  };

  makeKeyUpHandler = (direction: "left" | "right" | "up" | "down") => {
    return (e: KeyOrMouseEvent) => {
      e.preventDefault();
      console.log("stop", direction);
      this.sendMessage({
        type: WebSocketMsgTypes.controlStop,
        msg: { direction },
      });
      (this.setState as any)({ [direction]: false });
    };
  };

  componentDidMount() {
    const socket = this.getSocket();

    socket.addEventListener("message", event => {
      if (typeof event.data === "string") {
        try {
          const m = JSON.parse(event.data) as WebSocketMsg;
          switch (m.type) {
            case WebSocketMsgTypes.ping:
              this.sendMessage({
                type: WebSocketMsgTypes.pong,
                msg: {
                  ts: now(),
                },
              });
              this.setState({
                lastLagMs: (m.msg as PingPayload).lastLagMs as number,
              });
              break;
            default:
              break;
          }
        } catch (e) {
          console.error(e);
        }
      }
    });

    socket.addEventListener("error", e => {
      console.log("Socket Error", e);
    });

    mousetrap.bind("left", this.leftStart, "keydown");
    mousetrap.bind("left", this.leftEnd, "keyup");
    mousetrap.bind("right", this.rightStart, "keydown");
    mousetrap.bind("right", this.rightEnd, "keyup");
    mousetrap.bind("up", this.upStart, "keydown");
    mousetrap.bind("up", this.upEnd, "keyup");
    mousetrap.bind("down", this.downStart, "keydown");
    mousetrap.bind("down", this.downEnd, "keyup");
    mousetrap.bind("a", this.leftStart, "keydown");
    mousetrap.bind("a", this.leftEnd, "keyup");
    mousetrap.bind("d", this.rightStart, "keydown");
    mousetrap.bind("d", this.rightEnd, "keyup");
    mousetrap.bind("w", this.upStart, "keydown");
    mousetrap.bind("w", this.upEnd, "keyup");
    mousetrap.bind("s", this.downStart, "keydown");
    mousetrap.bind("s", this.downEnd, "keyup");
  }

  componentWillUnmount() {
    this.getSocket().close();

    mousetrap.unbind("q");
    mousetrap.unbind("e");

    mousetrap.unbind("left");
    mousetrap.unbind("right");
    mousetrap.unbind("up");
    mousetrap.unbind("down");
    mousetrap.unbind("a");
    mousetrap.unbind("d");
    mousetrap.unbind("w");
    mousetrap.unbind("s");
  }

  sendMessage = (m: AllWebSocketMsgs) => {
    console.log(`RobovacControl sending ${m.type}`);
    this.getSocket()?.send(JSON.stringify(m));
  };

  getWsUrl = () => {
    return `${WS_BASE_URL}/controls`;
  };

  socket?: WebSocket;
  getSocket = (): WebSocket => {
    if (!this.socket) {
      this.socket = new WebSocket(this.getWsUrl());
      this.socket.binaryType = "arraybuffer";
    }
    return this.socket;
  };

  render() {
    return (
      <>
        <table>
          <tr>
            <td></td>
            <td>
              <button
                style={{
                  backgroundColor: `${this.state.up ? "" : "light"}gray`,
                }}
                onMouseDown={this.upStart}
                onMouseUp={this.upEnd}
              >
                <FaChevronUp />
              </button>
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>
              <button
                style={{
                  backgroundColor: `${this.state.left ? "" : "light"}gray`,
                }}
                onMouseDown={this.leftStart}
                onMouseUp={this.leftEnd}
              >
                <FaChevronLeft />
              </button>
            </td>
            <td>
              <button
                style={{
                  backgroundColor: `${this.state.down ? "" : "light"}gray`,
                }}
                onMouseDown={this.downStart}
                onMouseUp={this.downEnd}
              >
                <FaChevronDown />
              </button>
            </td>
            <td>
              <button
                style={{
                  backgroundColor: `${this.state.right ? "" : "light"}gray`,
                }}
                onMouseDown={this.rightStart}
                onMouseUp={this.rightEnd}
              >
                <FaChevronRight />
              </button>
            </td>
            <td></td>
            <td></td>
          </tr>
        </table>
        <pre>{`last lag (ms): ${this.state.lastLagMs}`}</pre>
      </>
    );
  }
}

export default RobovacControl;
