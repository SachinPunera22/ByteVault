import type {Socket, TCPSocket} from "bun";
import {ClientConfiguration} from "./config/config";
import {MessageService} from "./message.service.ts";
import LoggerService from "./utils/logger-service";
import {AuthenticationService} from "./authentication/authentication-service";
import {EventEmitter} from "events";

export class DatabaseClient {
    public client!: TCPSocket;


    constructor() {
    }

    /**
     * Starts the client connection to the server
     * @returns {Promise<void>}
     */
    public async connectToServer(socket): Promise<TCPSocket> {
        try {
            const config = new ClientConfiguration();
            await config.readConfig(); // Load configuration file

            const hostname: string = config.get("hostname", "localhost");
            const port: number = Number(config.get("port", "4000"));
            this.client = await Bun.connect({
                hostname,
                port,
                socket
            });
            return this.client;
        } catch (error) {
            LoggerService.error(`Failed to connect to server: ${error}`);
        }
    }
}