import type { Socket } from "bun";
import { AuthenticationService } from "./authentication/authentication-service";
import { MessageService } from "./message.service";
import LoggerService from "./utils/logger-service";
import { systemEventService } from "./events/systemEvent.service.ts";
import { ClientCommands, ServerCommands } from "./constants.ts";
import { SocketService } from "./utils/socket.service.ts";

const messageService = new MessageService();
const socketService = SocketService.getInstance();

// Define socket event handlers
const socketHandlers: any = {
  data: messageService.receive.bind(messageService),
  open: (socket: Socket) => LoggerService.success("Client connected"),
  close: (socket: Socket) => LoggerService.error("Connection closed"),
  error: messageService.error.bind(messageService),
};

socketService
  .startServer(socketHandlers)
  .then((server: any) => {
    setupHealthCheckListener();
    // const authService = new AuthenticationService(messageService, socketService);
    // authService.initAuth();
  })
  .catch((error: any) => LoggerService.error(`Error occurred: ${error}`));

// Function to handle health check requests
function setupHealthCheckListener() {
  systemEventService.on(ClientCommands.PING, ({ data, socket }) => {
    messageService.send(
      {
        command: ServerCommands.PONG,
        message: Buffer.from("pong"),
        code: "SUCCESS",
      },
      socket
    );
  });
}