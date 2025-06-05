import {Router} from 'express'
import { getPopularOffers, getPopularProducts, getSummary } from '../controllers/home.controller'

const homeRouter = Router()
homeRouter.get('/summary',getSummary)
homeRouter.get('/popular-products',getPopularProducts)
homeRouter.get('/popular-offers',getPopularOffers)

export default homeRouter