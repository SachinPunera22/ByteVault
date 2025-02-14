import type { Socket, TCPSocketListener } from "bun";
import { ServerConfiguration } from "./config/config";
import { MessageService } from "./sever-message";

export class DatabaseServer {
  public server!: TCPSocketListener;
  constructor() {}

  /**
   * starts a server
   * @returns
   */
  public async startServer(): Promise<TCPSocketListener> {
    const config = new ServerConfiguration();
    await config.readConfig();
    const messageService = new MessageService();

    this.server = Bun.listen({
      hostname: config.get("hostname", "localhost"),
      port: +config.get("port", "4000"),
      socket: {
        data(socket: Socket, data: Buffer) {
          const message = messageService.receive(data);
          console.log(`Received data: ${message}`);
          messageService.send(Buffer.from("PONG"), socket);
        },
        open(socket: Socket) {
          console.log("Client connected");
        },
        close(socket) {
          console.log("Connection closed");
        },
        error(socket, error) {
          console.error("Error occurred:", error);
          socket.write(`Error occurred: ${error.message}`);
        },
      },
    });
    return this.server;
  }
}
