import type { Socket } from "bun";
import LoggerService from "../server/utils/logger-service.ts";
import { ServerStatusByte, StatusByte } from "./constants";
import { systemEventService } from "./events/systemEvent.service.ts";

export class MessageService {
  constructor() {}

  public send(
    payload: { command: any; message: Buffer | null },
    socket: Socket
  ) {
    const startBuffer = Buffer.alloc(1);
    startBuffer.write(StatusByte.START, "hex");
    const endBuffer = Buffer.alloc(1);
    endBuffer.write(StatusByte.END, "hex");
    const commandBuffer = Buffer.alloc(10, 0x20);
    commandBuffer.write(payload.command, "utf-8");
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

  private parsePayload(buffer: Buffer): {
    command: string;
    code: string;
    message: Buffer;
  } {
    const startBuffer = buffer.subarray(0, 1); // 1 bytes
    const commandBuffer = buffer.subarray(1, 11); // 10 bytes
    const endBuffer = buffer.subarray(-1); // 1 bytes
    const messageBuffer = buffer.subarray(11, -1); // Variable length message
    if (
      startBuffer.toString("hex") !== ServerStatusByte.OK ||
      startBuffer.toString("hex") !== ServerStatusByte.ERROR && endBuffer.toString("hex") !== ServerStatusByte.End
    ) {
      LoggerService.error("Error reading message from server");
    }
    let code =
      startBuffer.toString("hex") !== ServerStatusByte.OK ? "ERROR" : "SUCCESS";

    return {
      command: commandBuffer.toString("utf-8").trim(),
      code,
      message: messageBuffer,
    };
  }
}
