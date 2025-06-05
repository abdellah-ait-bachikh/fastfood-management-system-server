import {Router} from 'express'
import { getSummary } from '../controllers/home.controller'

const homeRouter = Router()
homeRouter.get('/summary',getSummary)

export default homeRouter