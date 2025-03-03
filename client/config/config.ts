import type { BunFile } from "bun";

export interface IConfig {
  hostname: string;
  port: number;
  password: string;
  username: string;
  cli_arguments: {
    host: string;
    port: number;
    password: string;
  }
}
export class ClientConfiguration {
  private config: IConfig = {
    hostname: "",
    port: 0,
    password: "",
    username: "",
    cli_arguments: {
      host: "",
      port: 0,
      password: ""
    }
  };
  private configFilePath = `${import.meta.dir}/client-config.cnf`;

  /**
   * Reads the config file and loads values into memory
   */
  public async readConfig(): Promise<void> {
    try {
      const file: BunFile = Bun.file(this.configFilePath);

      if (!(await file.exists())) {
        console.warn("Config file not found. Using default values!");
        return;
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
   * Returns value of a key from the config file
   * @param key
   * @param defaultValue
   */
  public get(key: keyof IConfig, defaultValue = ""): any {
    return this.config[key] || defaultValue;
  }

  /**
  * Returns value of a key from the config file
  * @param key
  * @param value
  */
  public set<K extends keyof IConfig>(key: K, value: IConfig[K]): void {
    // set config value
    this.config[key] = value;
  }
}
