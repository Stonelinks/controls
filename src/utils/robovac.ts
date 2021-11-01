import {
  ECOVACS_ACCOUNT_NAME,
  ECOVACS_ACCOUNT_PASSWORD,
} from "../common/constants";
import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";

// tslint:disable-next-line:no-var-requires
const EcovacsDeebot = require("ecovacs-deebot");
const EcoVacsAPI = EcovacsDeebot.EcoVacsAPI;
// tslint:disable-next-line:no-var-requires
const NodeMachineId = require("node-machine-id");

const countryCode = "us";
const deviceId = EcoVacsAPI.getDeviceId(NodeMachineId.machineIdSync(), 0);
const continent = EcovacsDeebot.countries[
  countryCode.toUpperCase()
].continent.toLowerCase();

const api = new EcoVacsAPI(deviceId, countryCode, continent);

interface Vacbot {
  run: (...s: string[]) => void;
  on: (s: string, cb: (v: any) => void) => void;
  connect: () => void;
  clean: () => void;
  stop: () => void;
  charge: () => void;
}

let vacbot: Vacbot = null;
export const getVacbot = async (): Promise<Vacbot> => {
  if (vacbot) {
    return vacbot;
  }
  while (!vacbot) {
    console.log("waiting for vacbot to initialize");
    await timeout(MILLISECONDS_IN_SECOND);
  }
  return vacbot;
};

export const connectToEcoVacs = async () =>
  new Promise<void>((resolve, reject) => {
    api
      .connect(ECOVACS_ACCOUNT_NAME, EcoVacsAPI.md5(ECOVACS_ACCOUNT_PASSWORD))
      .then(() => {
        api.devices().then(devices => {
          console.log("Devices:", JSON.stringify(devices));

          const _vacbot = api.getVacBot(
            api.uid,
            EcoVacsAPI.REALM,
            api.resource,
            api.user_access_token,
            devices[0],
            continent,
          );

          // Once the session has started the bot will fire a 'ready' event.
          // At this point you can request information from your vacuum or send actions to it.
          _vacbot.on("ready", event => {
            console.log("vacbot ready");

            let hasBatteryState = false;
            let hasGetCleanState = false;
            let hasGetChargeState = false;
            _vacbot.run("GetBatteryState");
            _vacbot.run("GetCleanState");
            _vacbot.run("GetChargeState");

            const checkResolve = () => {
              if (hasBatteryState && hasGetCleanState && hasGetChargeState) {
                vacbot = _vacbot;
                resolve();
              }
            };

            _vacbot.on("BatteryInfo", battery => {
              console.log("Battery level: " + Math.round(battery));
              hasBatteryState = true;
              checkResolve();
            });
            _vacbot.on("CleanReport", value => {
              console.log("Clean status: " + value);
              hasGetCleanState = true;
              checkResolve();
            });
            _vacbot.on("ChargeState", value => {
              console.log("Charge status: " + value);
              hasGetChargeState = true;
              checkResolve();
            });
          });
          _vacbot.connect();
        });
      })
      .catch(e => {
        reject(e);
      });
  });
