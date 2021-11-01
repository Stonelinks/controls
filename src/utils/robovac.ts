import {
  ECOVACS_ACCOUNT_NAME,
  ECOVACS_ACCOUNT_PASSWORD,
} from "../common/constants";
import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";
import { ChargeMode, CleanStatus, RoboVacState } from "../common/types";
import { getDb, setDbValue } from "./db";

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
const getVacbot = async (): Promise<Vacbot> => {
  while (!vacbot) {
    await timeout(MILLISECONDS_IN_SECOND);
  }
  return vacbot;
};

export const moveTurnAround = async () => {
  const v = await getVacbot();
  v.run("Move", "TurnAround");
};

export const moveForward = async () => {
  const v = await getVacbot();
  v.run("Move", "forward");
};

export const moveLeft = async () => {
  const v = await getVacbot();
  v.run("Move", "left");
};

export const moveRight = async () => {
  const v = await getVacbot();
  v.run("Move", "right");
};

export const moveStop = async () => {
  const v = await getVacbot();
  vacbot.run("Move", "stop");
};

const getVacState = async () => {
  const db = await getDb();
  return db.robovac;
};

const setVacState = async (vs: RoboVacState) => {
  const db = await getDb();
  db.robovac = vs;
  await setDbValue("robovac", db.robovac);
};

export const doClean = async () => {
  const v = await getVacbot();
  v.clean();
};

export const doStop = async () => {
  const v = await getVacbot();
  v.stop();
};

export const doCharge = async () => {
  const v = await getVacbot();
  v.charge();
};

export const connectToEcoVacs = async () =>
  new Promise<void>((resolve, reject) => {
    api
      .connect(ECOVACS_ACCOUNT_NAME, EcoVacsAPI.md5(ECOVACS_ACCOUNT_PASSWORD))
      .then(() => {
        api.devices().then(devices => {
          console.log("Devices:", JSON.stringify(devices));

          const v = api.getVacBot(
            api.uid,
            EcoVacsAPI.REALM,
            api.resource,
            api.user_access_token,
            devices[0],
            continent,
          );

          let hasResolved = false;

          let hasBatteryState = false;
          let hasGetCleanState = false;
          let hasGetChargeState = false;

          const checkResolve = () => {
            if (hasResolved) {
              return;
            }
            if (hasBatteryState && hasGetCleanState && hasGetChargeState) {
              hasResolved = true;
              vacbot = v;
              console.log("vacbot ready");
              resolve();
            }
          };

          v.on("ready", event => {
            v.on("BatteryInfo", async (battery: number) => {
              const vs = await getVacState();
              vs.batteryPercent = Math.round(battery);
              console.log("Battery level: " + vs.batteryPercent);
              await setVacState(vs);

              hasBatteryState = true;
              checkResolve();
            });
            v.on("CleanReport", async (value: CleanStatus) => {
              const vs = await getVacState();
              vs.cleanStatus = value;
              console.log("Clean status: " + vs.cleanStatus);
              await setVacState(vs);

              hasGetCleanState = true;
              checkResolve();
            });
            v.on("ChargeState", async (value: ChargeMode) => {
              const vs = await getVacState();
              vs.chargeMode = value;
              console.log("Charge status: " + vs.chargeMode);
              await setVacState(vs);

              hasGetChargeState = true;
              checkResolve();
            });

            v.run("GetBatteryState");
            v.run("GetCleanState");
            v.run("GetChargeState");
          });
          v.connect();
        });
      })
      .catch(e => {
        reject(e);
      });
  });
