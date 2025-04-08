import { password } from "bun";
import { ServerConfiguration } from "../config/config";
import * as crypto from "node:crypto";
export class HashEncryptService {
  private config: ServerConfiguration;
  static instance: HashEncryptService;
  constructor() {
    this.config = ServerConfiguration.getInstance();
  }
  public static getInstance(): HashEncryptService {
    if (!HashEncryptService.instance) {
      HashEncryptService.instance = new HashEncryptService();
    }
    return HashEncryptService.instance;
  }

  /**
   * Compares value and hash and returns true if match
   * @param value
   * @param hash
   */
  public async checkHash(value: string, hash: string): Promise<boolean> {
    return password.verify(value, hash);
  }

  /**
   * Returns hashed equivalent
   * @param value
   */
  public async createHash(value: string): Promise<string> {
    return password.hash(value, { algorithm: "bcrypt" });
  }

  /**
   * decrypt the password
   * @param encryptedText
   * @returns
   */
  public decrypt(encryptedText: string) {
    const secretKey = this.config.get("encryption_key");
    const iv = this.config.get("iv");
    const algorithm = this.config.get("algorithm");
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(secretKey, "utf8"),
      Buffer.from(iv, "utf8")
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted.toString();
  }
}
