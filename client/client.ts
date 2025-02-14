import { DatabaseClient } from "./database-client";
import LoggerService from "./utils/logger-service";

const client = new DatabaseClient();

client
  .connectToServer()
  .then(() => {
    LoggerService.success("Client successfully connected to the server.");
  })
  .catch((error) => {
    LoggerService.error(`Connection failed: ${error}`);
  });
