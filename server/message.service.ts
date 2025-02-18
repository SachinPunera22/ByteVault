import type {Socket} from "bun";
import {End, Start} from "./constants";
import {EventEmitter} from 'events'
import {systemEventService} from "./events/systemEvent.service.ts";
import LoggerService from "./utils/logger-service.ts";

export class MessageService extends EventEmitter {
    constructor() {
        super();
    }

    public send(payload: { command: string, message: Buffer, code: string }, socket: Socket) {
        const startBuffer = Buffer.from(Start, "hex"); // 2 bytes
        const endBuffer = Buffer.from(End, "hex");   // 2 bytes
        const codeBuffer = Buffer.alloc(10,  0x20); // Placeholder for 10-byte code
        codeBuffer.write(payload.code || 'SUCCESS', 0, "utf-8"); // Writing command
        const commandBuffer = Buffer.alloc(10,  0x20); // 10-byte command buffer
        commandBuffer.write(payload.command, "utf-8"); // Writing command
        const messageLength = payload.message.length;
        const totalLength = startBuffer.length + codeBuffer.length + commandBuffer.length + messageLength + endBuffer.length;

        const finalBuffer = Buffer.concat(
            [startBuffer, codeBuffer, commandBuffer, payload.message, endBuffer],
            totalLength
        );

        socket.write(finalBuffer);
    }

    public receive(socket: Socket, rawPayload: Buffer) {
        console.log('data:', rawPayload.toString('utf-8'))
        const payload = this.parsePayload(rawPayload)
        console.log("Payload:",this.parsePayload(rawPayload))

        console.log('payload:', payload)
        systemEventService.emit(payload.command, {data: payload.message, socket})
    }

    public error(socket: Socket, error: any) {
        const errorMessage = JSON.stringify(error?.message || error)
        LoggerService.error(errorMessage)
    }

    private parsePayload(buffer: Buffer): { command: string; message: Buffer } {
        const startBuffer = buffer.subarray(0, 1); // 1 bytes
        const commandBuffer = buffer.subarray(1, 11); // 10 bytes
        const endBuffer = buffer.subarray(-1); // 1 bytes
        const messageBuffer = buffer.subarray(11, -1); // Variable length message

        return {
            command: commandBuffer.toString("utf-8").trim(),
            message: messageBuffer
        };

    }
}
