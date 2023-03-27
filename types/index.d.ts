declare interface Modal {
  type?: ModalType;
  isOpen: boolean;
}

declare interface Settings {
  enableNotifications: boolean;
  enableHighlighter: boolean;
}

declare interface Window {
  globals: {
    openSite: (url: string) => Promise<void>;
  };
}

declare namespace NodeJS {
  interface Process {
    env: {
      VITE_DEV_SERVER_URL: string;
    };
  }
}

declare type ModalType = "settings";
declare type BrowserWindowType = "worker" | "normal";
