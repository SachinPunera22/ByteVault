import type { Socket } from "bun";
import { EventEmitter } from "events";
import { systemEventService } from "./events/systemEvent.service.ts";
import LoggerService from "./utils/logger-service.ts";
import { ClientStatusByte, StatusByte } from "./constants.ts";

export class MessageService extends EventEmitter {
  constructor() {
    super();
  }

  public send(
    payload: { command: string; message: Buffer | null; code: string },
    socket: Socket
  ) {
    let startBuffer = Buffer.alloc(1, StatusByte.OK);
    switch (payload.code) {
      case "SUCCESS":
        startBuffer.write(StatusByte.OK, "hex");
        break;
      case "ERROR":
        startBuffer.write(StatusByte.ERROR, "hex");
        break;
      default:
        startBuffer.write(StatusByte.OK, "hex");
    }
    const endBuffer = Buffer.alloc(1); // 1 bytes
    endBuffer.write(StatusByte.End, "hex");
    const commandBuffer = Buffer.alloc(10, 0x20); // 10-byte command buffer
    commandBuffer.write(payload.command, "utf-8"); // Writing command
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
  }

  public error(socket: Socket, error: any) {
    const errorMessage = JSON.stringify(error?.message || error);
    LoggerService.error(errorMessage);
  }

  private parsePayload(buffer: Buffer): { command: string; message: Buffer } {
    const startBuffer = buffer.subarray(0, 1); // 1 bytes

    const commandBuffer = buffer.subarray(1, 11); // 10 bytes
    const endBuffer = buffer.subarray(-1); // 1 bytes
    const messageBuffer = buffer.subarray(11, -1); // Variable length message
    if (
      startBuffer.toString("hex") !== ClientStatusByte.START ||
      endBuffer.toString("hex") !== ClientStatusByte.END
    ) {
      LoggerService.error("message from client is not valid");
    }
    return {
      command: commandBuffer.toString("utf-8").trim(),
      message: messageBuffer,
    };
  }
}
