import { ClientSocketService } from "../utils/socket.service";
import { MessageService } from "../message.service.ts";
import LoggerService from "../utils/logger-service";
import { EventEmitter } from "events";
import { password, type TCPSocket } from "bun";
import { systemEventService } from "../events/systemEvent.service.ts";
import { ClientCommands, StatusCode, ServerCommands } from "../constants.ts";
import { ClientConfiguration } from "../config/config.ts";
import * as crypto from "node:crypto";

export enum AuthStatus {
  INITIATED = "initiated",
  NOT_INITIALISED = "notInitialised",
  ACKNOwLEDGED = "acknowledged",
  AUTHENTICATED = "authenticated",
  WAITING = "waiting",
}
export class AuthenticationService {
  private messageService: MessageService;
  public authStatus: AuthStatus = AuthStatus.NOT_INITIALISED;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private socketService: ClientSocketService;
  private clientSocket: TCPSocket;
  static instance: AuthenticationService;
  private config: ClientConfiguration;

  constructor() {
    this.messageService = MessageService.getInstance();
    this.socketService = ClientSocketService.getInstance();
    this.clientSocket = this.socketService.getClientSocket();
    this.config = ClientConfiguration.getInstance();
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
  public login(data: Buffer) {
    LoggerService.info("send authentication credentials");
    const encryptionData = JSON.parse(data.toString());
    const cliData = this.config.get("cli_arguments");
    const cipher = crypto.createCipheriv(
      encryptionData.algorithm,
      Buffer.from(encryptionData.key),
      Buffer.from(encryptionData.iv)
    );
    let encrypted = cipher.update(cliData.password, "utf8", "hex");
    encrypted += cipher.final("hex");
    const userData = {
      username: cliData.username,
      password: encrypted,
    };
    this.messageService.send(
      {
        command: ClientCommands.AUTH,
        message: Buffer.from(JSON.stringify(userData)),
      },
      this.clientSocket
    );
    this.authStatus = AuthStatus.WAITING;
    this.timeoutHandle = setTimeout(() => {
      if (this.authStatus === AuthStatus.WAITING) {
        LoggerService.error("Authentication timeout. Closing connection.");
        this.clientSocket.end();
      }
    }, 5000);
  }

  /**
   * initialise authenticaiton
   */
  public initAuth() {
    LoggerService.info("Initializing authentication...");
    const cliData = this.config.get("cli_arguments");
    const authInitData = { username: cliData.username };
    this.messageService.send(
      {
        command: ClientCommands.AUTH_INIT,
        message: Buffer.from(JSON.stringify(authInitData)),
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
    systemEventService.on(ServerCommands.AUTH_ACK, ({ data, code, socket }) => {
      if (code.toString() == StatusCode.ERROR) {
        this.authStatus = AuthStatus.NOT_INITIALISED;
        LoggerService.error(data.toString());
        socket.end();
      } else {
        this.authStatus = AuthStatus.ACKNOwLEDGED;
        this.login(data);
      }
    });

    systemEventService.on(
      ServerCommands.AUTH_RESPONSE,
      ({ data, code, socket }) => {
        if (code.toString() == StatusCode.ERROR) {
          this.authStatus = AuthStatus.NOT_INITIALISED;
          LoggerService.error(data.toString());
          socket.end();
        } else {
          this.authStatus = AuthStatus.AUTHENTICATED;
          LoggerService.success("client authenticated");
        }
      }
    );
  }
}
