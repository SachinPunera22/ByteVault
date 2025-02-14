import type { Socket } from "bun";
import { End, Start } from "./constants";

export class MessageService {
  constructor() {}

  public send(message: Buffer, socket: Socket) {
    const messageLength = message.length;
    const startBuffer = Buffer.from(Start, "hex");
    const endBuffer = Buffer.from(End, "hex");
    const messageBuffer = Buffer.concat(
      [startBuffer, message, endBuffer],
      messageLength + 2
    );
    socket.write(messageBuffer);
  }

  public receive(buffer: Buffer) {
    const messageBuffer = Buffer.alloc(buffer.length - 2);
    buffer.copy(messageBuffer, 0, 1, buffer.length - 1);
    return messageBuffer.toString();
  }
}
