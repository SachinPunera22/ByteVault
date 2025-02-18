import type {Socket, TCPSocket} from "bun";
import type {MessageService} from "../message.service.ts";
import {systemEventService} from "../events/systemEvent.service.ts";
import LoggerService from "./logger-service.ts";

export class HealthService {

    constructor(protected socket: TCPSocket, protected messageService: MessageService) {
        this.setupListener();
    }

    public  checkConnection() {
        return this.messageService.send({command: 'ping', message: Buffer.from('ping')}, this.socket)
    }

    public async setupListener() {
        systemEventService.on('ping', () => this.checkConnection)
        systemEventService.on('pong', () => {
            LoggerService.success('pong')
        })

    }
}