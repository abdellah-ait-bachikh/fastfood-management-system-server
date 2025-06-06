import { Router } from "express";
import {
  getPopularOffers,
  getPopularProducts,
  getSummary,
  getTopRankingDelevery,
} from "../controllers/home.controller";

const homeRouter = Router();
homeRouter.get("/summary", getSummary);
homeRouter.get("/popular-products", getPopularProducts);
homeRouter.get("/popular-offers", getPopularOffers);
homeRouter.get("/popular-deleverys", getTopRankingDelevery);

export default homeRouter;
