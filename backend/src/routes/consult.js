import express from 'express'
import { body } from 'express-validator'
import * as consultController from '../controllers/consultController.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router()

router.use(authenticate)

router.post(
  '/',
  [
    body('question').notEmpty().withMessage('问题不能为空')
  ],
  consultController.consult
)

router.get('/suggestions', consultController.getSuggestions)

export default router
