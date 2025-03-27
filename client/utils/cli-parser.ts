import LoggerService from "./logger-service";

/**
 * Parses and validates command-line arguments for the client.
 * @returns {host: string, port: number, username :string, password: string}
 */
export function parseCliArguments(): {
  hostname: string;
  username: string;
  port: number;
  password: string;
} {
  const argv = process.argv.slice(2);

  if (
    argv.length !== 8 ||
    argv[0] !== "-h" ||
    argv[2] !== "-p" ||
    argv[4] !== "-u" ||
    argv[6] !== "-ps"
  ) {
    LoggerService.error("Invalid command format.");
    LoggerService.error(
      "Usage: bun run start:client -h <hostname> -p <port> -u <username> -ps <password>"
    );
    process.exit(1);
  }

  const port = parseInt(argv[3], 10);

  if (isNaN(port) || port <= 0) {
    LoggerService.error("Port must be a valid number.");
    process.exit(1);
  }
  return {
    hostname: argv[1],
    port: port,
    username: argv[5],
    password: argv[7],
  };
}
