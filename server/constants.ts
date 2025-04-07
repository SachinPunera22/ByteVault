export enum ServerCommands {
  PONG = "0010",
  AUTH_ACK = "0013",
  AUTH_RESPONSE = "0014",
  QUERY_RESPONSE = "0015",
}

export enum ClientCommands {
  PING = "0010",
  AUTH_INIT = "0011",
  AUTH = "0012",
  QUERY_EXECUTION = "0016",
}

export enum StatusByte {
  OK = "00",
  ERROR = "01",
  End = "02",
}

export enum ClientStatusByte {
  START = "00",
  END = "02",
}

export enum StatusCode {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}
