import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import { config } from "dotenv";
import { errorHandler } from "./moddlewares/errorHandler";
import homeRouter from "./routers/home.router";
import dayRouter from "./routers/dayRouter";

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

//routes
app.use("/api/home", homeRouter);
app.use("/api/days", dayRouter);

app.use(errorHandler);

const port = process.env.PORT;

export const startServer = () => {
  app.listen(port, () => {
    console.log(`server raning good in port = ${port}`);
  });
};
startServer();
