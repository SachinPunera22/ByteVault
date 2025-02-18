import type {TCPSocketListener} from "bun";
import {ServerConfiguration} from "./config/config";

export class DatabaseServer {
    public server!: TCPSocketListener<any>;

    constructor() {}

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
            socket: socket
        });

        return this.server;
    }
}
