import express from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router()

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('请输入有效的邮箱'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
    body('name').optional().trim().notEmpty().withMessage('姓名不能为空')
  ],
  authController.register
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('请输入有效的邮箱'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  authController.login
)

router.get('/me', authenticate, authController.getMe)

router.put('/profile', authenticate, authController.updateProfile)

router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('当前密码不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
  ],
  authController.changePassword
)

export default router
