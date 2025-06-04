import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { config } from "dotenv";

const app = express();

//use dotenv variables
config().parsed;

const corsOption: CorsOptions = {
  origin: "*",
  methods: ["POST", "Get", "PUT", "PATCH", "DELETE"],
};

//globale middlwares
app.use(cors(corsOption));
app.use(express.json());

const port = process.env.PORT;

export const startServer = () => {
  app.listen(port, () => {
    console.log(`server raning in port ${port}`);
  });
};
startServer();
