import { contextBridge, shell, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("globals", {
  openSite: async (url: string) => await shell.openExternal(url),
  saveSettings: async (
    settings: string
  ): Promise<string | NodeJS.ErrnoException> =>
    ipcRenderer.invoke("save-settings", settings),
  readSettings: (): Promise<Settings> => ipcRenderer.invoke("read-settings"),
});

console.log("Just minding mah business 👀");
