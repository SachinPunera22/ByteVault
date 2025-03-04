import { ClientSocketService } from "./utils/socket.service.ts";
import LoggerService from "./utils/logger-service";
import { MessageService } from "./message.service.ts";
import { HealthService } from "./utils/health.service.ts";
import { parseCliArguments } from "./utils/cli-parser.ts";
import type { Socket } from "bun";
import { ClientCliService } from "./utils/client-cli.service.ts";

// Parse CLI arguments
const cliArguments = parseCliArguments();

// Set up services
const messageService = new MessageService();
const socketHandlers: any = {
  data: messageService.receive.bind(messageService),
  open: (socket: Socket) => LoggerService.success("Client connected"),
  close: (socket: Socket) => LoggerService.error("Connection closed"),
  error: messageService.error.bind(messageService),
};

// Initialize the singleton client socket
const clientSocketService = ClientSocketService.getInstance();
clientSocketService
  .connect(socketHandlers, cliArguments)
  .then((clientSocket) => {
    LoggerService.success(
      `Client successfully connected to ${cliArguments.host}:${cliArguments.port}`
    );
    const healthService = new HealthService(messageService);
    healthService.checkConnection();
    process.stdin.on("data", (input: Buffer) => {
      let msg = input.toString().trim().toLowerCase();
      ClientCliService.getInstance().clientEvents(msg);
    });
  })
  .catch((error) => {
    LoggerService.error(`Connection failed: ${error}`);
  });
