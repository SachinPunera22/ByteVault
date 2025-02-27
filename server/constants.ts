export enum ServerCommands {
  PONG="0010"
}

export enum ClientCommands {
  PING="0010"
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

