import express from 'express'
import { body } from 'express-validator'
import * as familyController from '../controllers/familyController.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router()

router.use(authenticate)

router.post(
  '/members',
  [
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('年龄必须是0-150之间的数字'),
    body('role').optional().isIn(['parent', 'member']).withMessage('角色必须是parent或member')
  ],
  familyController.addMember
)

router.get('/members', familyController.getMembers)

router.get('/members/:id', familyController.getMemberById)

router.put(
  '/members/:id',
  [
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('年龄必须是0-150之间的数字'),
    body('role').optional().isIn(['parent', 'member']).withMessage('角色必须是parent或member')
  ],
  familyController.updateMember
)

router.delete('/members/:id', familyController.deleteMember)

router.get('/members/:id/medications', familyController.getMemberMedications)

export default router
