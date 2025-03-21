export enum ClientCommands {
  PING = "ping",
}

export enum ServerCommands {
  PONG = "pong",
}

export enum ServerStatusByte {
  OK = "00",
  ERROR = "01",
  End = "81",
}

export enum StatusByte {
  START = "00",
  END = "81",
}

export const ClientEvents = ["ping"];

export enum EventState {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface EventConfigurationInterface {
  maxRetries: number;
}
