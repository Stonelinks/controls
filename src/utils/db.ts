import * as fs from "fs";
import { DB_FILE } from "../common/constants";
import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";
import { Db, RoboVacState } from "../common/types";
import { readJsonAsync, writeJsonAsync } from "./files";

let db: Db | undefined;

const makeDefaultRoboVac = async (): Promise<RoboVacState> => {
  return {
    batteryPercent: 0,
    cleanStatus: "stop",
    chargeMode: "charging",
  };
};

const makeDefaultDb = async (): Promise<Db> => {
  return {
    robovac: await makeDefaultRoboVac(),
  };
};

export const getDb = async () => {
  while (!db) {
    await timeout(MILLISECONDS_IN_SECOND);
  }
  return db;
};

export const setDbValue = async <K extends keyof Db>(k: K, v: Db[K]) => {
  db[k] = v;
  await saveDb();
};

const saveDb = async (c?: Db) => {
  if (!c) {
    c = db;
  }

  console.log("writing db", c);
  await writeJsonAsync(DB_FILE, c);
};

export const initDb = async () => {
  // init a default db
  const defaultDb = await makeDefaultDb();
  if (!fs.existsSync(DB_FILE)) {
    await saveDb(defaultDb);
  }
  db = await readJsonAsync(DB_FILE);

  let dirty = false;
  for (const key in defaultDb) {
    if (defaultDb.hasOwnProperty(key)) {
      const defaultValue = defaultDb[key];
      if (!db.hasOwnProperty(key)) {
        dirty = true;
        db[key] = defaultValue;
      }
    }
  }
  if (dirty) {
    await saveDb(db);
  }
};
