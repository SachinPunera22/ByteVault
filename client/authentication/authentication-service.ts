import { ClientSocketService } from "../utils/socket.service";
import { MessageService } from "../message.service.ts";
import LoggerService from "../utils/logger-service";
import { EventEmitter } from "events";
import type { TCPSocket } from "bun";
import { systemEventService } from "../events/systemEvent.service.ts";
import { ClientCommands, StatusCode, ServerCommands } from "../constants.ts";

enum AuthStatus {
  INITIATED = "initiated",
  NOT_INITIALISED = "notInitialised",
  CONNECTED = "connected",
}
export class AuthenticationService {
  private messageService: MessageService;
  private authStatus: AuthStatus = AuthStatus.NOT_INITIALISED;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private socketService: ClientSocketService;
  private clientSocket: TCPSocket;
  static instance: AuthenticationService;

  constructor() {
    this.messageService = MessageService.getInstance();
    this.socketService = ClientSocketService.getInstance();
    this.clientSocket = this.socketService.getClientSocket();
    this.setupListener();
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Sends login credentials to the server
   */
  public login() {
    // const loginData = JSON.stringify({ code: "auth-init", username, password });

    // LoggerService.info(`Sending authentication request for ${username}`);
    this.messageService.send(
      { command: "auth-init", message: null },
      this.clientSocket
    );

    this.timeoutHandle = setTimeout(() => {
      if (this.authStatus === "initiated") {
        LoggerService.error("Authentication timeout. Closing connection.");
        this.clientSocket.end();
      }
    }, 3000);
  }

  /**
   * initialise authenticaiton
   */
  public initAuth() {
    LoggerService.info("Initializing authentication...");
    this.messageService.send(
      {
        command: ClientCommands.AUTH_INIT,
        message: Buffer.from("initiate authentication"),
      },
      this.clientSocket
    );
    this.authStatus = AuthStatus.INITIATED;
    this.timeoutHandle = setTimeout(() => {
      if (this.authStatus === "initiated") {
        LoggerService.error("Authentication timeout. Closing connection.");
        this.clientSocket.end();
      }
    }, 5000);
  }

  public async setupListener() {
    systemEventService.on(
      ServerCommands.AUTH_RESPONSE,
      ({ data, code, socket }) => {
        if (code.toString() == StatusCode.ERROR) {
          this.authStatus = AuthStatus.NOT_INITIALISED;
          LoggerService.error(data.toString());
          socket.end();
        } else {
          this.authStatus = AuthStatus.CONNECTED;
          LoggerService.success("client authenticated sucessfully");
        }
      }
    );
  }
}
