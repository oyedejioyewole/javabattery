import { app, BrowserWindow, Menu, Tray, Notification } from "electron";
import { join } from "path";
import battery from "battery";

const createWindow = () => {
  const window = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, "../out/preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon:
      process.platform === "linux"
        ? join(__dirname, "../build/icon.png")
        : join(__dirname, "../build/icon.ico"),
    title: "Javabattery",
  });
  window.loadURL(process.env.VITE_DEV_SERVER_URL);
};

const manageTrays = async (option?: "remove") => {
  const tray = new Tray(
    process.platform === "linux"
      ? join(__dirname, "../build/icon.png")
      : join(__dirname, "../build/icon.ico")
  );

  if (option === "remove") {
    tray.destroy();
    return;
  }

  const trayMenu = Menu.buildFromTemplate([
    { label: "Open", click: () => createWindow() },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(trayMenu);

  // watch(_battery, (_new) => {
  //   if (_new)
  //     tray.setToolTip(
  //       `Battery at (${_new.level ? _battery.value.level * 100 : ""}%) 👀`
  //     );
  // });
};

const ref = <T>(initialValue: T) => {
  const value = initialValue;
  return new Proxy(
    { value },
    {
      set: (target, key, newValue) => {
        const oldValue = target[key];

        if (oldValue.level === newValue.level) return;

        console.log("Battery percentage changed");
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
          } else if (approximatedBatteryLevels[0] === 0.5)
            notification.body = "I'll advise you to start charging now 👀";
          else if (approximatedBatteryLevels[0] === 0.3)
            notification.body = "You really need to starting charging 👀";
        } else if (
          approximatedBatteryLevels[1] === 0.15 &&
          !target[key].charging
        )
          notification.body = "I've warned you, now I'll shut up 👀";
        if (notification.body.length > 0) notification.show();
      },
    }
  );
};

(async () => {
  const _battery = ref(await battery());

  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  app.whenReady().then(() => {
    let interval: NodeJS.Timer;
    createWindow();

    app.on("window-all-closed", () => {
      manageTrays();

      interval = setInterval(async () => {
        _battery.value = await battery();
      }, 1000);
    });

    app.on("browser-window-created", () => {
      clearInterval(interval);
      manageTrays("remove");
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows.length === 0) createWindow();
    });
  });
})();
