import { DatabaseClient } from "./database-client";

const client = new DatabaseClient();

client.connectToServer().then(() => {
  console.log("Client successfully connected to the server.");
}).catch((error) => {
  console.error("Connection failed:", error);
});
