import type { Socket, TCPSocketListener } from "bun";
import LoggerService from "../utils/logger-service";
import { MessageService } from "../message.service";
import { EventEmitter } from "events";
import type { DatabaseServer } from "../database-server";
import {systemEventService} from "../events/systemEvent.service.ts";

export class AuthenticationService extends EventEmitter {
  public server:any ;
  constructor(protected messageService:MessageService,protected databaseServer:DatabaseServer) {
    super();
    this.server = databaseServer.server;
  }

  /**
   * Handles authentication request from client
   */
  public handleAuthRequest(auth:{data: Buffer, socket: any}) {
    try {
      LoggerService.info("Checking auth...");

      this.messageService.send(Buffer.from("OK"), auth.socket);
      LoggerService.info("Auth Success...");

    } catch (error) {
      console.log('error:',error)
      LoggerService.error("Invalid authentication data");
      this.messageService.send(Buffer.from("ERR: Invalid authentication data"), auth.socket);
      auth.socket.end();
      // this.emit("close-connection", "Invalid authentication data");
    }
  }

  /**
   * Registers event listeners for managing authentication state
   */
  public initAuth() {
    LoggerService.info("Handling authentication request...");

    systemEventService.on("auth-init", (data:any) => {
      this.handleAuthRequest(data);
    });


  }
}
