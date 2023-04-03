declare interface Modal {
  type?: ModalType;
  isOpen: boolean;
}

declare interface Settings {
  enableNotifications: boolean;
  enableHighlighter: boolean;
  notifyOnBatteryLevels: BatteryLevels;
}

declare interface Window {
  globals: {
    openSite: (url: string) => Promise<void>;
    saveSettings: (settings: string) => Promise<string | NodeJS.ErrnoException>;
    readSettings: () => Promise<Settings>;
  };
}

declare namespace NodeJS {
  interface Process {
    env: {
      VITE_DEV_SERVER_URL: string;
      NODE_ENV: "development" | "production";
    };
  }
}

declare type ModalType = "settings";

declare type BatteryLevels = Array<{
  level: number;
  whenCharging: boolean;
  whenDischarging: boolean;
}>;
