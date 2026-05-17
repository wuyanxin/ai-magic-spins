import mongoose from 'mongoose'

const medicationScheduleSchema = new mongoose.Schema({
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: [true, '药品ID不能为空'] 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, '用户ID不能为空'] 
  },
  scheduleType: { 
    type: String, 
    enum: ['daily', 'weekly', 'custom'], 
    default: 'daily' 
  },
  times: [{ type: String }],
  weekdays: [{ type: Number }],
  customDates: [{ type: Date }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
})

medicationScheduleSchema.index({ medicationId: 1 })
medicationScheduleSchema.index({ familyMemberId: 1 })
medicationScheduleSchema.index({ userId: 1 })
medicationScheduleSchema.index({ isActive: 1 })
medicationScheduleSchema.index({ startDate: 1, endDate: 1 })

export default mongoose.model('MedicationSchedule', medicationScheduleSchema)
