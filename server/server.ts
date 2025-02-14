import { DatabaseServer } from "./database-server";

const serverDB = new DatabaseServer();
serverDB
  .startServer()
  .then((server) => {
    console.log("server started on port:", server.port);
  })
  .catch((error) => {
    console.log("error occured", error);
  });
