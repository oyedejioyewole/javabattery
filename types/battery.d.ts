declare module "battery" {
  export default (): Promise<Battery> => {};
}

declare interface Battery {
  level: number;
  charging: boolean;
}
