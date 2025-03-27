import { password, type Socket } from "bun";
import LoggerService from "../utils/logger-service";
import { MessageService } from "../message.service";
import { systemEventService } from "../events/systemEvent.service.ts";
import { SocketService } from "../utils/socket.service.ts"; // Import Singleton SocketService
import { ClientCommands, ServerCommands, StatusCode } from "../constants.ts";
import { ServerConfiguration } from "../config/config.ts";
import { HashEncryptService } from "../utils/hash-encrypt.service.ts";

export class AuthenticationService {
  private socketService: SocketService; // Store the SocketService instance
  private messageService: MessageService;
  static instance: AuthenticationService;
  private config: ServerConfiguration;
  private hashEncryptService: HashEncryptService;

  constructor() {
    this.messageService = MessageService.getInstance();
    this.socketService = SocketService.getInstance(); // Get singleton instance
    this.setUpAuthenticationListener();
    this.config = ServerConfiguration.getInstance();
    this.hashEncryptService = new HashEncryptService();
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Handles authentication initialisation request from client
   */
  public handleAuthInitRequest(auth: { data: Buffer; socket: Socket }) {
    try {
      LoggerService.info("Initializing authentication...");
      const encryption = {
        key: this.config.get("encryption_key"),
        iv: this.config.get("iv"),
        algorithm: this.config.get("algorithm"),
      };
      this.messageService.send(
        {
          command: ServerCommands.AUTH_ACK,
          code: StatusCode.SUCCESS,
          message: Buffer.from(JSON.stringify(encryption)),
        },
        auth.socket
      );
    } catch (error) {
      LoggerService.error("Invalid authentication data");
      this.messageService.send(
        {
          command: ServerCommands.AUTH_ACK,
          code: StatusCode.ERROR,
          message: Buffer.from("ERR: Invalid authentication data"),
        },
        auth.socket
      );
      auth.socket.end();
    }
  }

  /**
   * Handles authentication request from client
   */
  public async handleAuthRequest(auth: { data: Buffer; socket: Socket }) {
    try {
      LoggerService.info("Checking auth credentials...");
      const userData = {
        username: this.config.get("username"),
        password: this.config.get("password"),
      };

      const authData = JSON.parse(auth.data.toString());
      if (authData.username !== userData.username) {
        throw Error;
      }
      const decrptedPass = this.hashEncryptService.decrypt(authData.password);
      const isValidPass = await this.hashEncryptService.checkHash(
        decrptedPass,
        userData.password
      );
      if (!isValidPass) {
        throw Error;
      }
      this.messageService.send(
        {
          command: ServerCommands.AUTH_RESPONSE,
          code: StatusCode.SUCCESS,
          message: Buffer.from("client authenticated!"),
        },
        auth.socket
      );
      LoggerService.success("Authentication Successfull");
    } catch (error) {
      LoggerService.error("Invalid authentication data");
      this.messageService.send(
        {
          command: ServerCommands.AUTH_RESPONSE,
          code: StatusCode.ERROR,
          message: Buffer.from("ERR: Invalid authentication data"),
        },
        auth.socket
      );

      auth.socket.end();
    }
  }

  public setUpAuthenticationListener() {
    systemEventService.on(ClientCommands.AUTH_INIT, ({ data, socket }) => {
      this.handleAuthInitRequest({ data, socket });
    });
    systemEventService.on(ClientCommands.AUTH, ({ data, socket }) => {
      this.handleAuthRequest({ data, socket });
    });
  }
}
