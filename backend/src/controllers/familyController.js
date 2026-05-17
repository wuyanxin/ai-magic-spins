import { validationResult } from 'express-validator'
import { FamilyMember, Medication, MedicationSchedule } from '../models/index.js'

export const addMember = async (req, res, next) => {
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
    
    const { name, phone, age, gender, role, healthConditions, allergies, avatar } = req.body
    
    const familyId = req.user.familyId
    
    if (!familyId) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '请先创建家庭'
        }
      })
    }
    
    const member = new FamilyMember({
      familyId,
      name,
      phone,
      age,
      gender,
      role: role || 'member',
      healthConditions,
      allergies,
      avatar,
      createdBy: req.userId
    })
    
    await member.save()
    
    res.status(201).json({
      success: true,
      data: member,
      message: '家庭成员添加成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getMembers = async (req, res, next) => {
  try {
    const familyId = req.user.familyId
    
    if (!familyId) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '请先创建家庭'
        }
      })
    }
    
    const members = await FamilyMember.find({ familyId }).sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: members
    })
  } catch (error) {
    next(error)
  }
}

export const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params
    const familyId = req.user.familyId
    
    const member = await FamilyMember.findOne({ _id: id, familyId })
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '家庭成员不存在'
        }
      })
    }
    
    res.json({
      success: true,
      data: member
    })
  } catch (error) {
    next(error)
  }
}

export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, phone, age, gender, role, healthConditions, allergies, avatar } = req.body
    const familyId = req.user.familyId
    
    const member = await FamilyMember.findOneAndUpdate(
      { _id: id, familyId },
      { name, phone, age, gender, role, healthConditions, allergies, avatar },
      { new: true, runValidators: true }
    )
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '家庭成员不存在'
        }
      })
    }
    
    res.json({
      success: true,
      data: member,
      message: '家庭成员信息更新成功'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const familyId = req.user.familyId
    
    const member = await FamilyMember.findOne({ _id: id, familyId })
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '家庭成员不存在'
        }
      })
    }
    
    await Medication.deleteMany({ familyMemberId: id })
    await MedicationSchedule.deleteMany({ familyMemberId: id })
    
    await FamilyMember.findByIdAndDelete(id)
    
    res.json({
      success: true,
      message: '家庭成员删除成功'
    })
  } catch (error) {
    next(error)
  }
}

export const getMemberMedications = async (req, res, next) => {
  try {
    const { id } = req.params
    const familyId = req.user.familyId
    
    const member = await FamilyMember.findOne({ _id: id, familyId })
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: '家庭成员不存在'
        }
      })
    }
    
    const medications = await Medication.find({ familyMemberId: id }).sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: medications
    })
  } catch (error) {
    next(error)
  }
}
