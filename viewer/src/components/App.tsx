import React from "react";
import { apiFetch } from "../utils/api";
import { frontendPath, isLocalhost, reload } from "../utils/url";
import ConfigEditor from "./ConfigEditor";
import DbViewer from "./DbViewer";
import RobovacControl from "./RobovacControl";

// tslint:disable-next-line:no-var-requires
const { Match, MatchFirst } = require("react-location");

enum CONNECTIVITY_STATE {
  unknown = "Loading...",
  connected = "Connected",
  disconnected = "Disconnected",
}

const App = () => {
  const [connectivityState, setConnectivityState] = React.useState(
    isLocalhost ? CONNECTIVITY_STATE.unknown : CONNECTIVITY_STATE.connected,
  );

  React.useEffect(() => {
    (async () => {
      switch (connectivityState) {
        case CONNECTIVITY_STATE.unknown:
          try {
            await apiFetch("robovac/connect");
            const ping = await apiFetch("ping");
            if (ping.pong === "pong") {
              setConnectivityState(CONNECTIVITY_STATE.connected);
            } else {
              reload();
            }
          } catch (e) {
            setConnectivityState(CONNECTIVITY_STATE.disconnected);
          }
          break;
        default:
          break;
      }
    })();
  }, [connectivityState]);

  return (
    <div>
      {connectivityState === CONNECTIVITY_STATE.connected ? (
        <div>
          <div style={{ display: "flex", borderBottom: "1px solid black" }}>
            <div style={{ flex: "1" }}>
              <h1>Controls</h1>
            </div>
          </div>
          {/* <div>
            <NavItem to={frontendPath("/")} title="Config" />
            <NavItem to={frontendPath("controls")} title="Controls" />
          </div> */}
          <div>
            <MatchFirst>
              {/* <Match path={frontendPath("controls")}>
              </Match> */}
              <Match path={frontendPath("/")}>
                <RobovacControl />
                <button onClick={() => apiFetch("robovac/clean")}>Clean</button>
                <button onClick={() => apiFetch("robovac/charge")}>
                  Charge
                </button>
                <button onClick={() => apiFetch("robovac/stop")}>Stop</button>
                <DbViewer />
                <ConfigEditor />
              </Match>
            </MatchFirst>
          </div>
        </div>
      ) : (
        connectivityState
      )}
    </div>
  );
};

export default App;
