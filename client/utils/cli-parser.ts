import LoggerService from "./logger-service";

/**
 * Parses and validates command-line arguments for the client.
 * @returns {host: string, port: number, password: string}
 */
export function parseCliArguments(): { host: string; port: number; password: string } {
  const argv = process.argv.slice(2);

  if (argv.length !== 6 || argv[0] !== "-u" || argv[2] !== "-p" || argv[4] !== "-ps") {
    LoggerService.error("Invalid command format.");
    LoggerService.error("Usage: bun run start:client -u <hostname> -p <port> -ps <password>");
    process.exit(1);
  }

  const port = parseInt(argv[3], 10);

  if (isNaN(port) || port <= 0) {
    LoggerService.error("Port must be a valid number.");
    process.exit(1);
  }

  return {
    host: argv[1],
    port: port,
    password: argv[5],
  };
}
