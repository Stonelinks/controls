import { SERVER_PORT } from "../common/constants";
import { encode } from "../common/encode";

const isHttps = window.location.protocol.startsWith("https");
export const HTTP_BASE_URL =
  process.env.PUBLIC_URL ||
  `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`;
export const WS_BASE_URL = process.env.PUBLIC_URL
  ? `ws${isHttps ? "s" : ""}://${window.location.hostname}${
      process.env.PUBLIC_URL
    }`
  : `ws${isHttps ? "s" : ""}://${window.location.hostname}:${SERVER_PORT}`;

export const apiFetch = async (url: string): Promise<any> => {
  const res = await window.fetch(`${HTTP_BASE_URL}/${url}`);
  const json = await res.json();
  return json;
};

export const fillInUrlTemplate = (urlTemplate: string, urlOptions?: object) => {
  if (!urlOptions) {
    return urlTemplate;
  }

  let finalUrl = urlTemplate;
  for (const key in urlOptions) {
    if (urlOptions.hasOwnProperty(key)) {
      const k = `:${key}`;
      const v = (urlOptions as any)[key];
      finalUrl = finalUrl.replace(k, encode(v));
    }
  }
  return finalUrl;
};
