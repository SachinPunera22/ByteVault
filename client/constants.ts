export enum ClientCommands {
  PING = "ping",
  AUTH_INIT = "auth-init",
  AUTH = "auth",
}

export enum ServerCommands {
  PONG = "pong",
  AUTH_RESPONSE = "auth-res",
  AUTH_ACK = "auth-ack",
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

export enum StatusCode {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}
