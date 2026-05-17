import express from 'express'
import multer from 'multer'
import { body } from 'express-validator'
import * as medicationController from '../controllers/medicationController.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只能上传图片文件'), false)
    }
  }
})

router.use(authenticate)

router.post('/parse', upload.single('image'), medicationController.parsePrescription)

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('药品名称不能为空')
  ],
  medicationController.addMedication
)

router.get('/', medicationController.getMedications)

router.get('/:id', medicationController.getMedicationById)

router.put('/:id', medicationController.updateMedication)

router.delete('/:id', medicationController.deleteMedication)

router.post(
  '/schedules',
  [
    body('medicationId').notEmpty().withMessage('药品ID不能为空'),
    body('scheduleType').isIn(['daily', 'weekly', 'custom']).withMessage('计划类型无效'),
    body('times').isArray({ min: 1 }).withMessage('提醒时间不能为空')
  ],
  medicationController.createSchedule
)

router.get('/schedules', medicationController.getSchedules)

router.put('/schedules/:id', medicationController.updateSchedule)

router.delete('/schedules/:id', medicationController.deleteSchedule)

export default router
