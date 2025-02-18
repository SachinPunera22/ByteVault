import type {Socket} from "bun";
import {MessageService} from "../message.service.ts";
import LoggerService from "../utils/logger-service";
import {EventEmitter} from "events";

export class AuthenticationService extends EventEmitter {
    private messageService: MessageService;
    private authStatus: "initiated" | "connected" = "initiated";
    private timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    constructor(eventEmitter: EventEmitter) {
        super();
        this.messageService = new MessageService();


        eventEmitter.on("server-message", (socket: Socket, message: string) => {
            this.handleAuthResponse(socket, message);
        });

        eventEmitter.on("disconnected", () => {
            LoggerService.error("Disconnected from the server.");
        });

        eventEmitter.on("error", (error: Error) => {
            LoggerService.error(`Error occurred: ${error.message}`);
        });
    }

    /**
     * Sends login credentials to the server
     */
    public login(socket: Socket, username: string, password: string) {
        const loginData = JSON.stringify({code: 'auth-init', username, password});
        LoggerService.info(`Sending authentication request for ${username}`);
        this.messageService.send({message: Buffer.from(loginData), command: "auth-res",}, socket);


        this.timeoutHandle = setTimeout(() => {
            if (this.authStatus === "initiated") {
                LoggerService.error("Authentication timeout. Closing connection.");
                socket.end();
            }
        }, 30000);
    }

    /**
     * Handles server response for authentication
     */
    public handleAuthResponse(socket: Socket, message: string) {
        if (message === "OK") {
            this.authStatus = "connected";
            if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
            LoggerService.success("Authentication successful!");
            this.emit("authenticated", socket);
        } else if (message.startsWith("ERR")) {
            LoggerService.error(`Authentication failed: ${message}`);
            this.emit("authentication-failed", socket, message);
            socket.end();
        }
    }
}
