import type { Socket } from "bun";
import { EventEmitter } from "events";
import { systemEventService } from "./events/systemEvent.service.ts";
import LoggerService from "./utils/logger-service.ts";
import {
  ClientCommands,
  ClientStatusByte,
  StatusByte,
  StatusCode,
} from "./constants.ts";
import * as crypto from "node:crypto";

export class MessageService {
  static instance: MessageService;
  constructor() {}
  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public send(
    payload: { command: string; message: Buffer | null; code: string },
    socket: Socket
  ) {
    let startBuffer = Buffer.alloc(1, StatusByte.OK);
    switch (payload.code) {
      case StatusCode.SUCCESS:
        startBuffer.write(StatusByte.OK, "hex");
        break;
      case StatusCode.ERROR:
        startBuffer.write(StatusByte.ERROR, "hex");
        break;
      default:
        startBuffer.write(StatusByte.OK, "hex");
    }
    const endBuffer = Buffer.alloc(1); // 1 bytes
    endBuffer.write(StatusByte.End, "hex");
    const commandBuffer = Buffer.alloc(2); // 2-byte command buffer
    commandBuffer.write(payload.command, "hex"); // Writing command
    const messageLength = payload.message?.length || 0;
    const totalLength =
      startBuffer.length +
      commandBuffer.length +
      messageLength +
      endBuffer.length;

    const finalBuffer = Buffer.concat(
      [startBuffer, commandBuffer, payload.message!, endBuffer],
      totalLength
    );
    socket.write(finalBuffer);
  }

  public receive(socket: Socket, rawPayload: Buffer) {
    const payload = this.parsePayload(rawPayload);
    systemEventService.emit(payload.command, { data: payload.message, socket });
    systemEventService.emit(ClientCommands.QUERY_EXECUTION, {
      data: Buffer.from("Create tabl users ()", "utf-8"),
      socket,
    });
  }

  public error(socket: Socket, error: any) {
    const errorMessage = JSON.stringify(error?.message || error);
    LoggerService.error(errorMessage);
  }

  private parsePayload(buffer: Buffer): { command: string; message: Buffer } {
    const startBuffer = buffer.subarray(0, 1); // 1 bytes

    const commandBuffer = buffer.subarray(1, 3); // 2 bytes
    const messageBuffer = buffer.subarray(3, -1); // Variable length message
    if (startBuffer.toString("hex") !== ClientStatusByte.START) {
      LoggerService.error("message from client is not valid");
    }
    return {
      command: commandBuffer.toString("hex").trim(),
      message: messageBuffer,
    };
  }
}
