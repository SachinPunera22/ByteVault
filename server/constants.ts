export enum ServerCommands {
  PONG="pong"
}

export enum ClientCommands {
  PING="ping"
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

