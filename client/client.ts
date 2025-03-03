import { DatabaseClient } from "./database-client";
import LoggerService from "./utils/logger-service";
import type { Socket } from "bun";
import { MessageService } from "./message.service.ts";
import { HealthService } from "./utils/health.service.ts";
import { parseCliArguments } from "./utils/cli-parser.ts"; // ✅ Import parser

// Parse CLI arguments
const cli_arguments = parseCliArguments();

// Set up services
const messageService = new MessageService();
const socket: any = {
  data: messageService.receive.bind(messageService),
  open: (socket: Socket) => LoggerService.success("Client connected"),
  close: (socket: Socket) => LoggerService.error("Connection closed"),
  error: messageService.error.bind(messageService),
};

// Connect client
const client = new DatabaseClient();
client
  .connectToServer(socket, cli_arguments)
  .then((socketInstance) => {
    LoggerService.success(`Client successfully connected to ${cli_arguments.host}:${cli_arguments.port}`);
    const healthService = new HealthService(socketInstance, messageService);
    healthService.checkConnection();
  })
  .catch((error) => {
    LoggerService.error(`Connection failed: ${error}`);
  });
