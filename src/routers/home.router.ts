import {Router} from 'express'
import { getPopularProducts, getSummary } from '../controllers/home.controller'

const homeRouter = Router()
homeRouter.get('/summary',getSummary)
homeRouter.get('/popular-products',getPopularProducts)

export default homeRouter