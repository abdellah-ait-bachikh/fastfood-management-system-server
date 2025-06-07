import { Router } from "express";
import { createDay,stopDay } from "../controllers/day.controller";
const dayRouter = Router();

dayRouter.post('/start',createDay)
dayRouter.put('/stop/:id',stopDay)
export default dayRouter;
