import { Router } from "express";
import {
    getMonthlyYearStatus,
  getPopularOffers,
  getPopularProducts,
  getSummary,
  getTopRankingDelevery,
  getYearsList,
} from "../controllers/home.controller";

const homeRouter = Router();
homeRouter.get("/summary", getSummary);
homeRouter.get("/popular-products", getPopularProducts);
homeRouter.get("/popular-offers", getPopularOffers);
homeRouter.get("/popular-deleverys", getTopRankingDelevery);
homeRouter.get("/monthly-year-status", getMonthlyYearStatus);
homeRouter.get("/years", getYearsList);

export default homeRouter;
