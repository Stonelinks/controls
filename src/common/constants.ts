import * as path from "path";

const prefixPath = (s: string) =>
  process.env.BASE_PATH
    ? `${(process as any).env.BASE_PATH}/${s}`
    : path.resolve(s);

export const VIEWER_FOLDER = path.resolve("./viewer/build");
export const SERVER_PORT =
  parseInt((process as any).env.SERVER_PORT, 10) || 4001;
export const CONFIG_FILE = prefixPath("config.json");
