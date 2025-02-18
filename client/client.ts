import {DatabaseClient} from "./database-client";
import LoggerService from "./utils/logger-service";
import type {Socket} from "bun";
import {MessageService} from "./message.service.ts";
import {HealthService} from "./utils/health.service.ts";


const messageService = new MessageService()
const socket: any = {
    data: messageService.receive.bind(messageService),
    open: (socket: Socket) => {
        LoggerService.success("Client connected");
    },
    close: (socket: Socket) => {
        LoggerService.error("Connection closed");
    },
    error: messageService.error.bind(messageService)
}
const client = new DatabaseClient();

client
    .connectToServer(socket)
    .then((socketInstance) => {
        LoggerService.success("Client successfully connected to the server.");
        const healthService = new HealthService(socketInstance, messageService);

         healthService.checkConnection();
    })
    .catch((error) => {
        LoggerService.error(`Connection failed: ${error}`);
    });
