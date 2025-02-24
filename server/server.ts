import type { Socket } from "bun";
import { AuthenticationService } from "./authentication/authentication-service";
import { DatabaseServer, type ISocket } from "./database-server";
import { MessageService } from "./message.service";
import LoggerService from "./utils/logger-service";
import { systemEventService } from "./events/systemEvent.service.ts";
import { ClientCommands, ServerCommands } from "./constants.ts";

const messageService = new MessageService();

const socket: any = {
  data: messageService.receive.bind(messageService),
  open: (socket: Socket) => {
    LoggerService.success("Client connected");
  },
  close: (socket: Socket) => {
    LoggerService.error("Connection closed");
  },
  error: messageService.error.bind(messageService),
};

const serverDB = new DatabaseServer();
serverDB
  .startServer(socket)
  .then((server) => {
    LoggerService.success(`Server started on port: ${server.port}`);
    setupHealthCheckListener(server);

    // const authService = new AuthenticationService(messageService, serverDB);
    // authService.initAuth();
  })
  .catch((error) => {
    LoggerService.error(`Error occured: ${error}`);
  });

function setupHealthCheckListener() {
  systemEventService.on(ClientCommands.PING, ({ data: any, socket }) => {
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
