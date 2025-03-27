import { password } from "bun";
import * as crypto from "node:crypto";
export interface EncryptionData {
  algorithm: string;
  key: string;
  iv: string;
}
export class HashEncryptService {
  /**
   * encypt the password
   * @param encryptionData
   * @param password
   * @returns
   */
  public encrypt(encryptionData: EncryptionData, password: string): string {
    const cipher = crypto.createCipheriv(
      encryptionData.algorithm,
      Buffer.from(encryptionData.key),
      Buffer.from(encryptionData.iv)
    );
    let encrypted = cipher.update(password, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }
}
