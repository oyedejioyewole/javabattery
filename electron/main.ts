import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  Notification,
  ipcMain,
} from "electron";
import { join, resolve } from "path";
import battery from "battery";
import { autoUpdater } from "electron-updater";
import { writeFile, existsSync } from "fs";
import tinydate from "tinydate";
import { randomUUID } from "crypto";
import { createServer } from "http";
import handler from "serve-handler";
import { readSettings } from "./utils";
import {
  enableHighlighter,
  enableNotifications,
  notifyOnBatteryLevels,
} from "../config/defaults.json";

let listeningPort: number;

if (app.isPackaged) {
  autoUpdater.checkForUpdatesAndNotify();

  // Create a server for the prebuilt files
  const server = createServer((request, response) => {
    return handler(request, response, {
      public: join(__dirname, "../.output/public"),
    });
  });
  listeningPort = Math.floor(Math.random() * (65_535 - 1024) + 1024);
  server.listen(listeningPort);

  app.on("before-quit", () => server.close());
} else {
  app.setPath("userData", join(__dirname, "../.temp/", app.name.toLowerCase()));
}

const configPath = resolve(app.getPath("userData"), "config.json");
const icon =
  process.platform === "linux"
    ? join(__dirname, "../build/icons/icon.png")
    : join(__dirname, "../build/icons/icon.ico");
const preload = app.isPackaged
  ? join(__dirname, "./preload.js")
  : join(__dirname, "../out/preload.js");

const createWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
    },
    icon,
  });

  window.loadURL(
    app.isPackaged
      ? `http://localhost:${listeningPort}`
      : process.env.VITE_DEV_SERVER_URL
  );
};

const createTrays = () => {
  const tray = new Tray(icon);

  const trayMenu = Menu.buildFromTemplate([
    { label: "Open", click: () => createWindow() },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(trayMenu);

  return tray;
};

const ref = <T>(initialValue: T) => {
  return new Proxy(
    { value: initialValue },
    {
      set: (target, key, newValue) => {
        if (key !== "value") return;
        const oldValue = target[key];

        if (oldValue.level === newValue.level) return;

        target[key] = newValue;

        const notification = new Notification({
          icon,
        });

        const batteryLevel = Number((newValue.level * 100).toFixed(0));
        const { notifyOnBatteryLevels } = readSettings(configPath);

        for (const { level } of notifyOnBatteryLevels) {
          if (batteryLevel === level) {
            notification.body = newValue.charging
              ? `You have reached ${batteryLevel}% 🎉`
              : `You at ${batteryLevel}% 👀`;
          }
        }

        if (notification.body.length > 0) notification.show();
      },
    }
  );
};

const setup = () => {
  if (!existsSync(configPath))
    writeFile(
      configPath,
      JSON.stringify({
        enableHighlighter,
        enableNotifications,
        notifyOnBatteryLevels: notifyOnBatteryLevels.sort(
          (a, b) => a.level - b.level
        ),
      }),
      () => {}
    );
};

(async () => {
  const _battery = ref(await battery());
  const trayList: Array<Tray> = [];

  setup();

  ipcMain.handle("save-settings", (_, settings: string) => {
    writeFile(configPath, settings, (error) => {
      const logPath = resolve(
        app.getPath("logs"),
        tinydate(`{YYYY}-{MM}-{DD}-${randomUUID()}.log`)()
      );

      if (error) writeFile(logPath, `[ERROR] ${error.message} `, () => {});
    });

    return "done";
  });

  ipcMain.handle("read-settings", () => {
    return readSettings(configPath);
  });

  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  app.whenReady().then(() => {
    let interval: NodeJS.Timer;
    createWindow();

    app.on("window-all-closed", () => {
      let { enableNotifications } = readSettings(configPath);

      trayList.push(createTrays());

      if (enableNotifications) {
        interval = setInterval(async () => {
          _battery.value = await battery();
        }, 1000);
      }
    });

    app.on("browser-window-created", () => {
      clearInterval(interval);

      if (trayList.length > 0) {
        for (const trayItem of trayList) {
          trayItem.destroy();
        }
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows.length === 0) createWindow();
    });
  });
})();
