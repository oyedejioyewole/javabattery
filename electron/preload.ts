import { contextBridge, shell } from "electron";
const { join } = require("path");

contextBridge.exposeInMainWorld("globals", {
  openSite: async (url: string) => await shell.openExternal(url),
  getPath: (...path: string[]) => join(__dirname, "..", ...path),
});

console.log("Just minding mah business 👀");
