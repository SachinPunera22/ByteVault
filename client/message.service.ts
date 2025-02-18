import type { Socket } from "bun";
import { End, Start } from "./constants";
import LoggerService from "../server/utils/logger-service.ts";
import {systemEventService} from "./events/systemEvent.service.ts";

export class MessageService {
  constructor() {}

  public send(payload: { command: string, message: Buffer  }, socket: Socket) {
    const startBuffer = Buffer.from(Start, "hex"); // 2 bytes
    const endBuffer = Buffer.from(End, "hex");   // 2 bytes

    const commandBuffer = Buffer.alloc(10, 0x20); // 10-byte command buffer
    commandBuffer.write(payload.command, "utf-8"); // Writing command


    const messageLength = payload.message.length;
    const totalLength = startBuffer.length  + commandBuffer.length + messageLength + endBuffer.length;

    const finalBuffer = Buffer.concat(
        [startBuffer, commandBuffer,payload.message, endBuffer],
        totalLength
    );
    socket.write(finalBuffer);
  }


  public receive(socket: Socket, rawPayload: Buffer) {
    const payload=this.parsePayload(rawPayload)
    systemEventService.emit(payload.command, {data: payload.message, socket})
  }

  public error(socket: Socket, error:any) {
    const errorMessage = JSON.stringify(error?.message||error)
    LoggerService.error(errorMessage)
  }

  private  parsePayload(buffer: Buffer): { command: string;code:string; message: Buffer } {
    const startBuffer = buffer.subarray(0, 2); // 2 bytes
    const codeBuffer = buffer.subarray(2, 12); // 10 bytes
    const commandBuffer = buffer.subarray(12, 22); // 10 bytes
    const endBuffer = buffer.subarray(-2); // 2 bytes
    const messageBuffer = buffer.subarray(22, -2); // Variable length message

    // return {
    //   command: commandBuffer.toString("utf-8").trim(),
    //   code: codeBuffer.toString('utf-8').trim(),
    //   message: messageBuffer
    // };
    return {
      command:'pong',
      code:'SUCCESS',
      message:Buffer.from('pong')
    }
  }
}
