import express from 'express'
import { body } from 'express-validator'
import * as reminderController from '../controllers/reminderController.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router()

router.use(authenticate)

router.get('/logs', reminderController.getReminderLogs)

router.put('/logs/:id/confirm', reminderController.confirmMedication)

router.put('/logs/:id/skip', reminderController.skipMedication)

router.get('/history', reminderController.getMedicationHistory)

router.get('/statistics', reminderController.getStatistics)

router.get('/notifications/preferences', reminderController.getNotificationPreferences)

router.put('/notifications/preferences', reminderController.updateNotificationPreferences)

router.post('/notifications/test', reminderController.sendTestNotification)

export default router
