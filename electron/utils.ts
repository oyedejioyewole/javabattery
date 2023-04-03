import { readFileSync } from "fs";

const readSettings = (settingsPath: string) => {
  return JSON.parse(readFileSync(settingsPath, "utf-8")) as Settings;
};

export { readSettings };
