import { Router } from "express";
import { createDay,getLastDay,stopDay } from "../controllers/day.controller";
const dayRouter = Router();

dayRouter.get('/last',getLastDay)
dayRouter.post('/start',createDay)
dayRouter.put('/stop/:id',stopDay)
export default dayRouter;
