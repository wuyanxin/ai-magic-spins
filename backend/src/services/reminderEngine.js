import cron from 'node-cron'
import { MedicationSchedule, ReminderLog, Medication, FamilyMember, NotificationPreference } from '../models/index.js'
import NotificationService from './notificationService.js'
import LLMService from './llmService.js'

class ReminderEngine {
  constructor() {
    this.isRunning = false
  }

  start() {
    if (this.isRunning) {
      console.log('Reminder engine already running')
      return
    }

    this.isRunning = true
    
    cron.schedule('* * * * *', async () => {
      await this.checkAndSendReminders()
    })

    cron.schedule('0 * * * *', async () => {
      await this.markMissedReminders()
    })

    console.log('Reminder engine started')
  }

  async checkAndSendReminders() {
    try {
      const now = new Date()
      const currentMinute = now.toISOString().slice(0, 16)
      const reminderTime = new Date(currentMinute)

      const schedules = await MedicationSchedule.find({
        isActive: true,
        startDate: { $lte: reminderTime },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: reminderTime } }
        ]
      })

      for (const schedule of schedules) {
        const shouldRemind = await this.shouldSendReminder(schedule, reminderTime)
        
        if (shouldRemind) {
          const existingLog = await ReminderLog.findOne({
            scheduleId: schedule._id,
            scheduledTime: {
              $gte: new Date(reminderTime.getTime() - 60000),
              $lte: new Date(reminderTime.getTime() + 60000)
            }
          })

          if (!existingLog) {
            await this.createAndSendReminder(schedule, reminderTime)
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  }

  async shouldSendReminder(schedule, reminderTime) {
    const currentTimeStr = reminderTime.toISOString().slice(11, 16)
    const currentDay = reminderTime.getDay()
    const currentDate = reminderTime.toISOString().slice(0, 10)

    if (!schedule.times.includes(currentTimeStr)) {
      return false
    }

    if (schedule.scheduleType === 'weekly') {
      if (!schedule.weekdays.includes(currentDay)) {
        return false
      }
    } else if (schedule.scheduleType === 'custom') {
      if (!schedule.customDates.some(date => 
        date.toISOString().slice(0, 10) === currentDate
      )) {
        return false
      }
    }

    return true
  }

  async createAndSendReminder(schedule, reminderTime) {
    try {
      const medication = await Medication.findById(schedule.medicationId)
      if (!medication || !medication.isActive) {
        return
      }

      const familyMember = schedule.familyMemberId 
        ? await FamilyMember.findById(schedule.familyMemberId)
        : null

      const preferences = await NotificationPreference.findOne({ userId: schedule.userId })

      if (preferences?.quietHoursEnabled) {
        const currentTime = reminderTime.toISOString().slice(11, 16)
        const quietStart = preferences.quietHoursStart
        const quietEnd = preferences.quietHoursEnd

        if (this.isInQuietHours(currentTime, quietStart, quietEnd)) {
          console.log('Quiet hours active, skipping reminder')
          return
        }
      }

      const reminderLog = new ReminderLog({
        scheduleId: schedule._id,
        medicationId: medication._id,
        familyMemberId: schedule.familyMemberId,
        userId: schedule.userId,
        scheduledTime: reminderTime,
        reminderTime: new Date()
      })

      await reminderLog.save()

      const notification = {
        title: '服药提醒 💊',
        body: `该服用 ${medication.name} 了${familyMember ? `（${familyMember.name}）` : ''}。\n剂量：${medication.dosage || '请遵医嘱'}`,
        data: {
          type: 'medication_reminder',
          medicationId: medication._id,
          reminderId: reminderLog._id,
          timestamp: Date.now()
        }
      }

      if (preferences?.webPushEnabled) {
        const sent = await NotificationService.sendWebPush(schedule.userId, notification)
        reminderLog.notificationSent.webPush = sent
      }

      if (preferences?.smsEnabled && preferences.smsPhone) {
        const sent = await NotificationService.sendSMS(preferences.smsPhone, notification.body)
        reminderLog.notificationSent.sms = sent
      }

      if (preferences?.emailEnabled && preferences.emailAddress) {
        const sent = await NotificationService.sendEmail(preferences.emailAddress, notification.title, notification.body)
        reminderLog.notificationSent.email = sent
      }

      await reminderLog.save()

      console.log(`Reminder sent for medication: ${medication.name} at ${reminderTime}`)
    } catch (error) {
      console.error('Error creating and sending reminder:', error)
    }
  }

  isInQuietHours(currentTime, quietStart, quietEnd) {
    return currentTime >= quietStart || currentTime < quietEnd
  }

  async markMissedReminders() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

      const missedLogs = await ReminderLog.find({
        status: 'pending',
        scheduledTime: { $lt: oneHourAgo }
      })

      for (const log of missedLogs) {
        log.status = 'missed'
        await log.save()

        console.log(`Marked reminder as missed: ${log._id}`)
      }

      console.log(`Marked ${missedLogs.length} reminders as missed`)
    } catch (error) {
      console.error('Error marking missed reminders:', error)
    }
  }

  async getMissedDoseSuggestion(medicationId, missedTime) {
    try {
      const medication = await Medication.findById(medicationId)
      if (!medication) {
        throw new Error('药品不存在')
      }

      const suggestion = await LLMService.suggestMissedDose(
        medication,
        missedTime,
        new Date().toISOString()
      )

      return suggestion
    } catch (error) {
      console.error('Error getting missed dose suggestion:', error)
      throw error
    }
  }
}

export default new ReminderEngine()
