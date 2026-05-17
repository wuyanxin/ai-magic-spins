import { validationResult } from 'express-validator'
import { Medication, MedicationSchedule, ReminderLog } from '../models/index.js'
import LLMService from '../services/llmService.js'

export const parsePrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '请上传处方单图片'
        }
      })
    }
    
    const imageBase64 = req.file.buffer.toString('base64')
    
    const result = await LLMService.parsePrescription(imageBase64)
    
    res.json({
      success: true,
      data: result,
      message: '处方单解析成功'
    })
  } catch (error) {
    next(error)
  }
}

export const addMedication = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '验证失败',
          details: errors.array()
        }
      })
    }
    
    const {
      name,
      specification,
      dosage,
      frequency,
      timing,
      duration,
      instructions,
      notes,
      source,
      prescriptionImage,
      familyMemberId,
      expiryDate
    } = req.body
    
    const medication = new Medication({
      userId: req.userId,
      familyMemberId,
      name,
      specification,
      dosage,
      frequency,
      timing,
      duration,
      instructions,
      notes,
      source: source || 'manual',
      prescriptionImage,
      expiryDate
    })
    
    await medication.save()
    
    res.status(201).json({
      success: true,
      data: medication,
      message: '药品添加成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getMedications = async (req, res, next) => {
  try {
    const { familyMemberId, isActive } = req.query
    
    const query = { userId: req.userId }
    
    if (familyMemberId) {
      query.familyMemberId = familyMemberId
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true'
    }
    
    const medications = await Medication.find(query)
      .populate('familyMemberId', 'name')
      .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: medications
    })
  } catch (error) {
    next(error)
  }
}

export const getMedicationById = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const medication = await Medication.findOne({ _id: id, userId: req.userId })
      .populate('familyMemberId', 'name phone age')
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '药品不存在'
        }
      })
    }
    
    res.json({
      success: true,
      data: medication
    })
  } catch (error) {
    next(error)
  }
}

export const updateMedication = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      name,
      specification,
      dosage,
      frequency,
      timing,
      duration,
      instructions,
      notes,
      isActive,
      expiryDate
    } = req.body
    
    const medication = await Medication.findOneAndUpdate(
      { _id: id, userId: req.userId },
      {
        name,
        specification,
        dosage,
        frequency,
        timing,
        duration,
        instructions,
        notes,
        isActive,
        expiryDate
      },
      { new: true, runValidators: true }
    )
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '药品不存在'
        }
      })
    }
    
    res.json({
      success: true,
      data: medication,
      message: '药品信息更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteMedication = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const medication = await Medication.findOne({ _id: id, userId: req.userId })
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '药品不存在'
        }
      })
    }
    
    await MedicationSchedule.deleteMany({ medicationId: id })
    await ReminderLog.deleteMany({ medicationId: id })
    
    await Medication.findByIdAndDelete(id)
    
    res.json({
      success: true,
      message: '药品删除成功'
    })
  } catch (error) {
    next(error)
  }
}

export const createSchedule = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '验证失败',
          details: errors.array()
        }
      })
    }
    
    const { medicationId, familyMemberId, scheduleType, times, weekdays, customDates, startDate, endDate } = req.body
    
    const medication = await Medication.findOne({ _id: medicationId, userId: req.userId })
    if (!medication) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '药品不存在'
        }
      })
    }
    
    const schedule = new MedicationSchedule({
      medicationId,
      familyMemberId: familyMemberId || medication.familyMemberId,
      userId: req.userId,
      scheduleType,
      times,
      weekdays,
      customDates,
      startDate: startDate || new Date(),
      endDate
    })
    
    await schedule.save()
    
    res.status(201).json({
      success: true,
      data: schedule,
      message: '用药计划创建成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getSchedules = async (req, res, next) => {
  try {
    const { medicationId, familyMemberId, isActive } = req.query
    
    const query = { userId: req.userId }
    
    if (medicationId) {
      query.medicationId = medicationId
    }
    
    if (familyMemberId) {
      query.familyMemberId = familyMemberId
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true'
    }
    
    const schedules = await MedicationSchedule.find(query)
      .populate('medicationId', 'name specification')
      .populate('familyMemberId', 'name')
      .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: schedules
    })
  } catch (error) {
    next(error)
  }
}

export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params
    const { times, weekdays, customDates, startDate, endDate, isActive } = req.body
    
    const schedule = await MedicationSchedule.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { times, weekdays, customDates, startDate, endDate, isActive },
      { new: true, runValidators: true }
    )
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '用药计划不存在'
        }
      })
    }
    
    res.json({
      success: true,
      data: schedule,
      message: '用药计划更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const schedule = await MedicationSchedule.findOne({ _id: id, userId: req.userId })
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '用药计划不存在'
        }
      })
    }
    
    await ReminderLog.deleteMany({ scheduleId: id })
    
    await MedicationSchedule.findByIdAndDelete(id)
    
    res.json({
      success: true,
      message: '用药计划删除成功'
    })
  } catch (error) {
    next(error)
  }
}
