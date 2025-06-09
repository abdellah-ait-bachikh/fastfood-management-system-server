import { Router } from "express";
import {
  createDay,
  deleteDay,
  getDaysWithPaymentsCount,
  getLastDay,
  stopDay,
} from "../controllers/day.controller";
const dayRouter = Router();

dayRouter.get("/last", getLastDay);
dayRouter.post("/start", createDay);
dayRouter.put("/stop/:id", stopDay);
dayRouter.get("/payments-money-count", getDaysWithPaymentsCount);
dayRouter.delete("/:id", deleteDay);
export default dayRouter;
