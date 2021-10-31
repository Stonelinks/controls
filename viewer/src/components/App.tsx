import React from "react";
import { apiFetch } from "../utils/api";
import { frontendPath, isLocalhost, reload } from "../utils/url";
import ConfigEditor from "./ConfigEditor";
import NavItem from "./NavItem";
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
          <div>
            <NavItem to={frontendPath("/")} title="Config" />
            <NavItem to={frontendPath("controls")} title="Controls" />
          </div>
          <div>
            <MatchFirst>
              <Match path={frontendPath("controls")}>
                <RobovacControl />
              </Match>
              <Match path={frontendPath("/")}>
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
