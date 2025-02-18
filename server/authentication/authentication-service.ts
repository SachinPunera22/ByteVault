import type { Socket, TCPSocketListener } from "bun";
import LoggerService from "../utils/logger-service";
import { MessageService } from "../message.service";
import { EventEmitter } from "events";
import type { DatabaseServer } from "../database-server";

export class AuthenticationService extends EventEmitter {
  public server:any ;
  constructor(protected messageService:MessageService,databaseServer:DatabaseServer) {
    super();
    this.server = databaseServer.server;
  }

  /**
   * Handles authentication request from client
   */
  public handleAuthRequest( data: Buffer,socket:any) {
    try {


      this.messageService.send(Buffer.from("OK"), socket);

      // const message = this.messageService.receive(data);
      // LoggerService.info(`Raw authentication message: ${message}`); 


  
      //{ const parsedMessage = JSON.parse(message);
      // LoggerService.info(`Parsed authentication data: ${JSON.stringify(parsedMessage)}`);
  
      // const { username, password } = parsedMessage;
  
      // if (!username || !password) {
      //   LoggerService.error("Missing username or password");
      //   this.messageService.send(Buffer.from("ERR: Missing username or password"), socket);
      //   socket.end();
      //   this.emit("authentication-failed", socket, "Missing username or password");
      //   return;
      // }

      // LoggerService.success(`Authentication request received - Username: ${username}`);
      // this.messageService.send(Buffer.from("OK"), socket);
      // this.emit("authenticated", socket, username);}
    } catch (error) {
      LoggerService.error("Invalid authentication data");
      this.messageService.send(Buffer.from("ERR: Invalid authentication data"), socket);
      socket.end();
      // this.emit("close-connection", "Invalid authentication data");
    }
  }

  /**
   * Registers event listeners for managing authentication state
   */
  public initAuth() {
    // this.on("data-received", (socket, message) => this.emit("data-received", socket, message));
    // this.on("client-connected", (socket) => this.emit("client-connected", socket));
    // this.on("client-disconnected", (socket) => this.emit("client-disconnected", socket));
    // this.on("error", (socket, error) => this.emit("error", socket, error));

    this.on("auth-init", ( auth: any,socket:any) => {
      LoggerService.info("Handling authentication request...");
      this.handleAuthRequest(auth,socket);
    });

    // this.on("authenticated", (socket: Socket, username: string) => {
    //   LoggerService.success(`Authentication successful for ${username}`);
    //   this.messageService.send(Buffer.from("OK"), socket);
    // });

    // this.on("authentication-failed", (socket: Socket, reason: string) => {
    //   LoggerService.error(`Authentication failed: ${reason}`);
    //   socket.end();
    // });
  }
}
