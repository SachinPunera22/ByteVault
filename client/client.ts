import { ClientSocketService } from "./utils/socket.service.ts";
import LoggerService from "./utils/logger-service";
import { MessageService } from "./message.service.ts";
import { HealthService } from "./utils/health.service.ts";
import { parseCliArguments } from "./utils/cli-parser.ts";
import type { Socket } from "bun";
import { ClientCliService } from "./utils/client-cli.service.ts";
import { AuthenticationService } from "./authentication/authentication-service.ts";

// Parse CLI arguments
const cliArguments = parseCliArguments();

// Set up services
const messageService = MessageService.getInstance();
const clientCliService = ClientCliService.getInstance();

const socketHandlers: any = {
  data: (socket: Socket, rawPayload: Buffer) =>
    clientCliService.handleServerResponse(socket, rawPayload),
  open: (socket: Socket) => {
    clientCliService.initialize(socket);
  },

  close: (socket: Socket) => LoggerService.error("Connection closed"),
  error: messageService.error.bind(messageService),
};

// Initialize the singleton client socket
const clientSocketService = ClientSocketService.getInstance();
clientSocketService
  .connect(socketHandlers, cliArguments)
  .then((clientSocket) => {
    const healthService = new HealthService();
    healthService.checkConnection();
    ClientCliService.getInstance().startListening();
  })
  .catch((error) => {
    LoggerService.error(`Connection failed: ${error}`);
  });
