import type { TCPSocket } from "bun";
import LoggerService from "./logger-service";
import { ClientConfiguration } from "../config/config";

export class ClientSocketService {
  private static instance: ClientSocketService;
  private clientSocket!: TCPSocket;
  private configService: ClientConfiguration;

  private constructor() {
    this.configService = new ClientConfiguration();
  }

  public static getInstance(): ClientSocketService {
    if (!ClientSocketService.instance) {
      ClientSocketService.instance = new ClientSocketService();
    }
    return ClientSocketService.instance;
  }

  /**
   * Connects the client socket to the server.
   */
  public async connect(
    socketHandlers: any,
    cliArguments: { host: string; port: number; password: string }
  ): Promise<TCPSocket> {
    if (this.clientSocket) {
      LoggerService.info("Client socket already connected...");
      return this.clientSocket;
    }

    try {
      this.configService.set("cli_arguments", cliArguments);
      this.clientSocket = await Bun.connect({
        hostname: cliArguments.host,
        port: cliArguments.port,
        socket: socketHandlers,
      });

      LoggerService.success(`Connected to server at ${cliArguments.host}:${cliArguments.port}`);
      return this.clientSocket;
    } catch (error) {
      LoggerService.error(`Failed to connect to server: ${error}`);
      throw error;
    }
  }

  /**
   * Returns the client socket instance.
   */
  public getClientSocket(): TCPSocket {
    if (!this.clientSocket) {
      throw new Error("Client socket has not been initialized.");
    }
    return this.clientSocket;
  }
}
