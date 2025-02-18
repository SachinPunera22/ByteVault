import type { Socket } from "bun";
import { End, Start } from "./constants";
import {EventEmitter} from 'events'

export class MessageService extends EventEmitter {
  constructor( ) {
    super();
  }

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

  public receive(socket:Socket, buffer: Buffer) {
    const messageBuffer = Buffer.alloc(buffer.length - 2);
    buffer.copy(messageBuffer, 0, 1, buffer.length - 1);
    let code = 'auth-init'
    this.emit(code, messageBuffer)

    // return messageBuffer.toString();
  }

  public error(socket:Socket, buffer: Buffer) {
    const messageBuffer = Buffer.alloc(buffer.length - 2);
    buffer.copy(messageBuffer, 0, 1, buffer.length - 1);
    return messageBuffer.toString();
  }
}
