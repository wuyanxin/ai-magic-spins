import LLMService from '../services/llmService.js'
import { Medication, FamilyMember } from '../models/index.js'

export const consult = async (req, res, next) => {
  try {
    const { question } = req.body

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '问题不能为空'
        }
      })
    }

    let userContext = {
      age: null,
      healthConditions: [],
      allergies: [],
      currentMedications: []
    }

    const familyMemberId = req.query.familyMemberId
    if (familyMemberId) {
      const member = await FamilyMember.findById(familyMemberId)
      if (member) {
        userContext.age = member.age
        userContext.healthConditions = member.healthConditions || []
        userContext.allergies = member.allergies || []
      }
    } else {
      const members = await FamilyMember.find({ createdBy: req.userId })
      members.forEach(member => {
        if (member.age) userContext.age = member.age
        userContext.healthConditions.push(...(member.healthConditions || []))
        userContext.allergies.push(...(member.allergies || []))
      })
    }

    const medications = await Medication.find({ 
      userId: req.userId, 
      isActive: true 
    })
    userContext.currentMedications = medications.map(med => 
      `${med.name} (${med.dosage || '剂量请遵医嘱'})`
    )

    const answer = await LLMService.answerMedicationQuestion(question, userContext)

    res.json({
      success: true,
      data: {
        question,
        answer,
        context: {
          hasProfile: !!(userContext.age || userContext.healthConditions.length),
          medicationsCount: medications.length
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getSuggestions = async (req, res, next) => {
  try {
    const { familyMemberId } = req.query

    let userProfile = {
      age: null,
      healthConditions: [],
      allergies: []
    }

    let medicationHistory = []

    if (familyMemberId) {
      const member = await FamilyMember.findById(familyMemberId)
      if (member) {
        userProfile.age = member.age
        userProfile.healthConditions = member.healthConditions || []
        userProfile.allergies = member.allergies || []
      }
    }

    const medications = await Medication.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)

    medicationHistory = medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timing: med.timing,
      notes: med.notes,
      isActive: med.isActive
    }))

    const suggestions = await LLMService.generateSuggestions(userProfile, medicationHistory)

    res.json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    next(error)
  }
}
