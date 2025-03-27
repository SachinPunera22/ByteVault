import type { BunFile } from "bun";

export class ServerConfiguration {
  private config: Record<string, string> = {};
  static instance: ServerConfiguration;

  /**
   * Sets dynamic hostname and port in config
   */
  public async readConfig(): Promise<void> {
    try {
      const file: BunFile = Bun.file(`${import.meta.dir}/server-config.cnf`);

      if (!(await file.exists())) {
        console.warn("Config file not found. Using default values!");
      }

      const text: string = await file.text();
      this.config = Object.fromEntries(
        text
          .split("\n")
          .map((line: string) => line.trim())
          .filter((line: string) => line && !line.startsWith("#"))
          .map((line: string) =>
            line.split("=").map((v: string) => v.trim().replace(/^"|"$/g, ""))
          )
      );
    } catch (error) {
      console.error("Failed to load configuration: ", error);
    }
  }

  /**
   * Returns value of key from cnf file or default value
   * @param key
   * @param defaultValue
   */
  public get(key: string, defaultValue = ""): string {
    return this.config[key] || defaultValue;
  }

  public static getInstance(): ServerConfiguration {
    if (!ServerConfiguration.instance) {
      ServerConfiguration.instance = new ServerConfiguration();
    }
    return ServerConfiguration.instance;
  }
}
