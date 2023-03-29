import { contextBridge, shell, ipcRenderer } from "electron";
const { join } = require("path");

contextBridge.exposeInMainWorld("globals", {
  openSite: async (url: string) => await shell.openExternal(url),
  getPath: (...path: string[]) => join(__dirname, "..", ...path),
  saveSettings: async (
    settings: string
  ): Promise<string | NodeJS.ErrnoException> =>
    ipcRenderer.invoke("save-settings", settings),
});

console.log("Just minding mah business 👀");
