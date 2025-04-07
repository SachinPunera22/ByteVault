export enum ClientCommands {
  PING = "0010",
  AUTH_INIT = "0011",
  AUTH = "0012",
  QUERY_EXECUTION = "0016",
}

export enum ServerCommands {
  QUERY_EXECUTION_RESPONSE = "0015",
  PONG = "0010",
  AUTH_ACK = "0013",
  AUTH_RESPONSE = "0014",
}

export enum ServerStatusByte {
  OK = "00",
  ERROR = "01",
  End = "02",
}

export enum StatusByte {
  START = "00",
  END = "02",
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
