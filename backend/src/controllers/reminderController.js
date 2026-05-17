import { ReminderLog, MedicationLog, MedicationSchedule, Medication, NotificationPreference } from '../models/index.js'
import NotificationService from '../services/notificationService.js'

export const getReminderLogs = async (req, res, next) => {
  try {
    const { scheduleId, status, startDate, endDate, page = 1, limit = 20 } = req.query
    
    const query = { userId: req.userId }
    
    if (scheduleId) {
      query.scheduleId = scheduleId
    }
    
    if (status) {
      query.status = status
    }
    
    if (startDate || endDate) {
      query.scheduledTime = {}
      if (startDate) {
        query.scheduledTime.$gte = new Date(startDate)
      }
      if (endDate) {
        query.scheduledTime.$lte = new Date(endDate)
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const logs = await ReminderLog.find(query)
      .populate('scheduleId', 'times')
      .populate('medicationId', 'name specification dosage')
      .populate('familyMemberId', 'name')
      .sort({ scheduledTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await ReminderLog.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

export const confirmMedication = async (req, res, next) => {
  try {
    const { id } = req.params
    const { notes } = req.body
    
    const log = await ReminderLog.findOne({ _id: id, userId: req.userId })
    
    if (!log) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '提醒记录不存在'
        }
      })
    }
    
    if (log.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '该提醒已被处理'
        }
      })
    }
    
    log.status = 'taken'
    log.takenTime = new Date()
    log.confirmedBy = req.userId
    log.responseTime = Math.floor((log.takenTime - log.scheduledTime) / 1000)
    if (notes) {
      log.notes = notes
    }
    await log.save()
    
    const medicationLog = new MedicationLog({
      userId: req.userId,
      familyMemberId: log.familyMemberId,
      medicationId: log.medicationId,
      scheduleId: log.scheduleId,
      reminderLogId: log._id,
      scheduledTime: log.scheduledTime,
      actualTime: log.takenTime,
      status: 'taken',
      notes
    })
    await medicationLog.save()
    
    res.json({
      success: true,
      data: log,
      message: '服药确认成功'
    })
  } catch (error) {
    next(error)
  }
}

export const skipMedication = async (req, res, next) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    
    const log = await ReminderLog.findOne({ _id: id, userId: req.userId })
    
    if (!log) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '提醒记录不存在'
        }
      })
    }
    
    if (log.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '该提醒已被处理'
        }
      })
    }
    
    log.status = 'skipped'
    log.notes = reason || '用户跳过'
    await log.save()
    
    const medicationLog = new MedicationLog({
      userId: req.userId,
      familyMemberId: log.familyMemberId,
      medicationId: log.medicationId,
      scheduleId: log.scheduleId,
      reminderLogId: log._id,
      scheduledTime: log.scheduledTime,
      status: 'skipped',
      notes: reason
    })
    await medicationLog.save()
    
    res.json({
      success: true,
      data: log,
      message: '已跳过此次服药'
    })
  } catch (error) {
    next(error)
  }
}

export const getMedicationHistory = async (req, res, next) => {
  try {
    const { familyMemberId, medicationId, status, startDate, endDate, page = 1, limit = 20 } = req.query
    
    const query = { userId: req.userId }
    
    if (familyMemberId) {
      query.familyMemberId = familyMemberId
    }
    
    if (medicationId) {
      query.medicationId = medicationId
    }
    
    if (status) {
      query.status = status
    }
    
    if (startDate || endDate) {
      query.actualTime = {}
      if (startDate) {
        query.actualTime.$gte = new Date(startDate)
      }
      if (endDate) {
        query.actualTime.$lte = new Date(endDate)
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const logs = await MedicationLog.find(query)
      .populate('medicationId', 'name specification dosage')
      .populate('familyMemberId', 'name')
      .sort({ actualTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await MedicationLog.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getStatistics = async (req, res, next) => {
  try {
    const { familyMemberId, startDate, endDate } = req.query
    
    const matchQuery = { userId: req.userId }
    
    if (familyMemberId) {
      matchQuery.familyMemberId = familyMemberId
    }
    
    if (startDate || endDate) {
      matchQuery.actualTime = {}
      if (startDate) {
        matchQuery.actualTime.$gte = new Date(startDate)
      }
      if (endDate) {
        matchQuery.actualTime.$lte = new Date(endDate)
      }
    }
    
    const statistics = await MedicationLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
    
    const totalLogs = await MedicationLog.countDocuments(matchQuery)
    
    const statusMap = {}
    statistics.forEach(stat => {
      statusMap[stat._id] = stat.count
    })
    
    const adherenceRate = totalLogs > 0
      ? Math.round((statusMap.taken || 0) / totalLogs * 100)
      : 0
    
    res.json({
      success: true,
      data: {
        total: totalLogs,
        taken: statusMap.taken || 0,
        missed: statusMap.missed || 0,
        skipped: statusMap.skipped || 0,
        partial: statusMap.partial || 0,
        adherenceRate
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getNotificationPreferences = async (req, res, next) => {
  try {
    let preferences = await NotificationPreference.findOne({ userId: req.userId })
    
    if (!preferences) {
      preferences = new NotificationPreference({
        userId: req.userId
      })
      await preferences.save()
    }
    
    res.json({
      success: true,
      data: preferences
    })
  } catch (error) {
    next(error)
  }
}

export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const {
      webPushEnabled,
      smsEnabled,
      smsPhone,
      emailEnabled,
      emailAddress,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      advanceNotice,
      repeatInterval
    } = req.body
    
    let preferences = await NotificationPreference.findOne({ userId: req.userId })
    
    if (!preferences) {
      preferences = new NotificationPreference({
        userId: req.userId
      })
    }
    
    Object.assign(preferences, {
      webPushEnabled,
      smsEnabled,
      smsPhone,
      emailEnabled,
      emailAddress,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      advanceNotice,
      repeatInterval
    })
    
    await preferences.save()
    
    res.json({
      success: true,
      data: preferences,
      message: '通知设置更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const sendTestNotification = async (req, res, next) => {
  try {
    const { type } = req.body
    
    const preferences = await NotificationPreference.findOne({ userId: req.userId })
    
    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '请先配置通知设置'
        }
      })
    }
    
    const testNotification = {
      title: '测试通知',
      body: '这是一条测试通知，用于验证通知功能是否正常。',
      data: {
        type: 'test',
        timestamp: Date.now()
      }
    }
    
    let sent = false
    
    if (type === 'webpush' && preferences.webPushEnabled) {
      sent = await NotificationService.sendWebPush(req.userId, testNotification)
    } else if (type === 'sms' && preferences.smsEnabled && preferences.smsPhone) {
      sent = await NotificationService.sendSMS(preferences.smsPhone, testNotification.body)
    } else if (type === 'email' && preferences.emailEnabled && preferences.emailAddress) {
      sent = await NotificationService.sendEmail(preferences.emailAddress, testNotification.title, testNotification.body)
    } else {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '该通知渠道未启用或未配置'
        }
      })
    }
    
    if (sent) {
      res.json({
        success: true,
        message: `${type === 'webpush' ? 'Web推送' : type === 'sms' ? '短信' : '邮件'}测试通知发送成功`
      })
    } else {
      res.status(500).json({
        success: false,
        error: {
          type: 'NOTIFICATION_ERROR',
          message: '通知发送失败'
        }
      })
    }
  } catch (error) {
    next(error)
  }
}
