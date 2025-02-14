import { DatabaseServer } from "./database-server";
import LoggerService from "./utils/logger-service";

const serverDB = new DatabaseServer();
serverDB
  .startServer()
  .then((server) => {
    LoggerService.success(`Server started on port: ${server.port}`);
  })
  .catch((error) => {
    LoggerService.error(`Error occured: ${error}`);
  });
