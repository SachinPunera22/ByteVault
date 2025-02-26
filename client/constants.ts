export enum ClientCommands {
  PING = "0010",
}

export enum ServerCommands {
  PONG = "0010",
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
