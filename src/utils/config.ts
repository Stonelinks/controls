import * as fs from "fs";
import { CONFIG_FILE } from "../common/constants";
import { MILLISECONDS_IN_SECOND, timeout } from "../common/time";
import { Config } from "../common/types";
import { readJsonAsync, writeJsonAsync } from "./files";

let config: Config | undefined;

const makeDefaultConfig = async (): Promise<Config> => {
  return {};
};

export const getConfig = async () => {
  while (!config) {
    await timeout(MILLISECONDS_IN_SECOND);
  }
  return config;
};

export const setConfigValue = async <K extends keyof Config>(
  k: K,
  v: Config[K],
) => {
  config[k] = v;
  await saveConfig();
};

const saveConfig = async (c?: Config) => {
  if (!c) {
    c = config;
  }

  console.log("writing config", c);
  await writeJsonAsync(CONFIG_FILE, c);
};

export const initConfig = async () => {
  // init a default config
  const defaultConfig = await makeDefaultConfig();
  if (!fs.existsSync(CONFIG_FILE)) {
    await saveConfig(defaultConfig);
  }
  config = await readJsonAsync(CONFIG_FILE);

  let dirty = false;
  for (const key in defaultConfig) {
    if (defaultConfig.hasOwnProperty(key)) {
      const defaultValue = defaultConfig[key];
      if (!config.hasOwnProperty(key)) {
        dirty = true;
        config[key] = defaultValue;
      }
    }
  }
  if (dirty) {
    await saveConfig(config);
  }
};
