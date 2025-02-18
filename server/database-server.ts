import type { Socket, TCPSocketListener } from "bun";
import { ServerConfiguration } from "./config/config";
import LoggerService from "./utils/logger-service";
import { AuthenticationService } from "./authentication/authentication-service";
import { EventEmitter } from "events";
import { MessageService } from "./message.service";


export interface ISocket  {
   data: ()=>{},
   

};
export class DatabaseServer {
  public server!: TCPSocketListener<ISocket>;
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Starts the server
   * @returns
   */
  public async startServer(socket: any): Promise<TCPSocketListener> {
    const config = new ServerConfiguration();
    await config.readConfig();

    this.server = Bun.listen<any>({
      hostname: config.get("hostname", "localhost"),
      port: +config.get("port", "4000"),
      socket:socket

    });

    return this.server;
  }
}
