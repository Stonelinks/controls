export const MILLISECONDS_IN_SECOND = 1000;
export const MILLISECONDS_IN_MINUTE = 60 * MILLISECONDS_IN_SECOND;
export const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE;
export const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;
export const MILLISECONDS_IN_YEAR = 365 * MILLISECONDS_IN_DAY;
export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
export const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
export const MINUTES_IN_HOUR = 60;
export const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
export const MINUTES_IN_YEAR = 365 * MINUTES_IN_DAY;
export const HOURS_IN_DAY = 24;
export const HOURS_IN_YEAR = 365 * HOURS_IN_DAY;
export const DAYS_IN_WEEK = 7;

export const timeout = (delayMs: number) =>
  new Promise(res => setTimeout(res, delayMs));

export const now = () => Date.now();
