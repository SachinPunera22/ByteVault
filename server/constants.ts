export enum ServerCommands {
  PONG = "pong",
  AUTH_ACK = "auth-ack",
  AUTH_RESPONSE = "auth-res",
}

export enum ClientCommands {
  PING = "ping",
  AUTH_INIT = "auth-init",
  AUTH = "auth",
}

export enum StatusByte {
  OK = "00",
  ERROR = "01",
  End = "81",
}

export enum ClientStatusByte {
  START = "00",
  END = "81",
}

export enum StatusCode {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}
