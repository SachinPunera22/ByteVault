import type { TCPSocketListener, Socket } from "bun";
import LoggerService from "./logger-service";
import { ServerConfiguration } from "../config/config";

export class SocketService {
  private static instance: SocketService;
  private serverSocket!: TCPSocketListener<any>; // Server socket instance
  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public async startServer(socketHandlers: any): Promise<TCPSocketListener> {
    if (this.serverSocket) {
      LoggerService.info("Server socket already running...");
      return this.serverSocket;
    }

    const config = new ServerConfiguration();
    await config.readConfig();

    this.serverSocket = Bun.listen<any>({
      hostname: config.get("hostname", "localhost"),
      port: +config.get("port", "4000"),
      socket: socketHandlers,
    });

    LoggerService.success(`Server started on port ${this.serverSocket.port}`);
    return this.serverSocket;
  }

  public getServerSocket(): TCPSocketListener<any> {
    if (!this.serverSocket) {
      throw new Error("Server socket has not been initialized.");
    }
    return this.serverSocket;
  }
}
