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
import { writeFile, readFileSync, existsSync } from "fs";
import tinydate from "tinydate";
import { randomUUID } from "crypto";
import { createServer } from "http";
import handler from "serve-handler";

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
}

const createWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      preload: app.isPackaged
        ? join(__dirname, "./preload.js")
        : join(__dirname, "../out/preload.js"),
      nodeIntegration: true,
    },
    icon:
      process.platform === "linux"
        ? join(__dirname, "../build/icons/icon.png")
        : join(__dirname, "../build/icons/icon.ico"),
  });

  window.loadURL(
    app.isPackaged
      ? `http://localhost:${listeningPort}`
      : process.env.VITE_DEV_SERVER_URL
  );
};

const createTrays = () => {
  const tray = new Tray(
    process.platform === "linux"
      ? join(__dirname, "../build/icons/icon.png")
      : join(__dirname, "../build/icons/icon.ico")
  );

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
        const oldValue = target[key];

        if (oldValue.level === newValue.level) return;

        target[key] = newValue;

        const notification = new Notification({
          icon:
            process.platform === "linux"
              ? join(__dirname, "../public/icon.png")
              : join(__dirname, "../public/icon.ico"),
        });

        const approximatedBatteryLevels = [
          Number(target[key].level.toFixed(1)),
          Number(target[key].level.toFixed(2)),
        ];

        if (approximatedBatteryLevels[0] === approximatedBatteryLevels[1]) {
          if (target[key].charging) {
            if (approximatedBatteryLevels[0] === 0.9)
              notification.body = "You can stop charging the device now 🎉";
            else if (approximatedBatteryLevels[0] === 0.5)
              notification.body = "You've reached the halfway mark 🎉";
            else if (approximatedBatteryLevels[0] === 1) {
              notification.body = "The device is fully charged 🎉";
            }
            return;
          }

          if (approximatedBatteryLevels[0] === 0.5)
            notification.body = "I'll advise you to start charging now 👀";
          else if (approximatedBatteryLevels[0] === 0.3)
            notification.body = "You really need to starting charging 👀";
        }

        if (approximatedBatteryLevels[1] === 0.15 && !target[key].charging)
          notification.body = "I've warned you, now I'll shut up 👀";
        if (notification.body.length > 0) notification.show();
      },
    }
  );
};

(async () => {
  const _battery = ref(await battery());
  const trayList: Array<Tray> = [];
  const configPath = resolve(app.getPath("userData"), "config.json");

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

  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  app.whenReady().then(() => {
    if (!existsSync(configPath)) writeFile(configPath, "", () => {});

    let interval: NodeJS.Timer;
    createWindow();

    app.on("window-all-closed", () => {
      let { enableNotifications }: Settings = JSON.parse(
        readFileSync(configPath, "utf-8").toString()
      );

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
