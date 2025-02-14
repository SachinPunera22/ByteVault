class LoggerService {
  private static colors = {
    reset: "\x1b[0m",
    white: "\x1b[37m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
  };

  private static formatMessage(level: string, message: string, color: string) {
    const timestamp = new Date().toISOString();
    return `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${
      this.colors.reset
    }`;
  }

  static log(message: string) {
    console.log(this.formatMessage("LOG", message, this.colors.white));
  }

  static info(message: string) {
    console.log(this.formatMessage("INFO", message, this.colors.blue));
  }

  static success(message: string) {
    console.log(this.formatMessage("SUCCESS", message, this.colors.green));
  }

  static error(message: string) {
    console.log(this.formatMessage("ERROR", message, this.colors.red));
  }

  static displayServerResponse(response: {
    type: string;
    message: string;
    errorCode?: number;
  }) {
    const { type, message, errorCode } = response;

    switch (type.toLowerCase()) {
      case "ok":
        console.log(
          this.formatMessage("OK", `Query OK, ${message}`, this.colors.green)
        );
        break;

      case "error":
        console.log(
          this.formatMessage(
            "ERROR",
            `ERROR ${errorCode || "0000"}: ${message}`,
            this.colors.red
          )
        );
        break;

      case "result":
        console.log(this.formatMessage("RESULT", message, this.colors.white));
        break;

      default:
        this.log(message);
    }
  }
}

export default LoggerService;
