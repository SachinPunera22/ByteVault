import LoggerService from "../server/utils/logger-service.ts";
import {
  EventState,
  ServerStatusByte,
  StatusByte,
  type EventConfigurationInterface,
} from "./constants";
import type { Socket } from "bun";
import { systemEventService } from "./events/systemEvent.service";

export class MessageService {
  private retryCount = 0;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private waitingForResponse = false;
  public eventState = EventState.INACTIVE;
  static instance: MessageService;
  constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public send(
    payload: { command: any; message: Buffer | null },
    socket: Socket,
    eventConfiguration?: EventConfigurationInterface
  ) {
    this.eventState = EventState.ACTIVE;
    this.waitingForResponse = true;
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
    if (eventConfiguration)
      this.setRetryTimeout(payload, socket, eventConfiguration);
  }

  private setRetryTimeout(
    payload: { command: any; message: Buffer | null },
    socket: Socket,
    eventConfiguration: EventConfigurationInterface
  ) {
    this.retryTimeout = setTimeout(() => {
      if (this.retryCount < eventConfiguration.maxRetries) {
        this.retryCount++;
        this.send(payload, socket, eventConfiguration);
      } else {
        LoggerService.error("Max retries reached. Closing connection.");
        socket.end();
        return;
      }
    }, 3000);
  }

  public receive(socket: Socket, rawPayload: Buffer) {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    this.waitingForResponse = false;
    const payload = this.parsePayload(rawPayload);
    systemEventService.emit(payload.command, { data: payload.message, socket });
    this.retryCount = 0;
    this.eventState = EventState.INACTIVE;
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
    const startBuffer = buffer.subarray(0, 1); // 1 byte
    const commandBuffer = buffer.subarray(1, 11); // 10 bytes
    const endBuffer = buffer.subarray(-1); // 1 byte
    const messageBuffer = buffer.subarray(11, -1); // Variable length message

    if (
      startBuffer.toString("hex") !== ServerStatusByte.OK ||
      (startBuffer.toString("hex") !== ServerStatusByte.ERROR &&
        endBuffer.toString("hex") !== ServerStatusByte.End)
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
