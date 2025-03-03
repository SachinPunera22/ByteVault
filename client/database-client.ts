import type { Socket, TCPSocket } from "bun";
import { ClientConfiguration } from "./config/config";
import LoggerService from "./utils/logger-service";

export class DatabaseClient {
  public client!: TCPSocket;
  public configService: ClientConfiguration;
  constructor() {
    this.configService = new ClientConfiguration();
  }

  /**
   * Starts the client connection to the server
   * @returns {Promise<TCPSocket>}
   */
  public async connectToServer(socket: Socket, cli_arguments: { host: string; port: number; password: string }): Promise<TCPSocket> {
    try {
        const storedConfig= this.configService.readConfig();
        this.configService.set('cli_arguments',cli_arguments)

      this.client = await Bun.connect({
        hostname: cli_arguments.host,
        port: cli_arguments.port,
        socket: socket as any,
      });

      LoggerService.success(`Connected to server at ${cli_arguments.host}:${cli_arguments.port}`);
      return this.client;
    } catch (error) {
      LoggerService.error(`Failed to connect to server: ${error}`);
      throw error;
    }
  }

}