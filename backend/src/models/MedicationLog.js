import mongoose from 'mongoose'

const medicationLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, '用户ID不能为空'] 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  medicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication', 
    required: [true, '药品ID不能为空'] 
  },
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MedicationSchedule' 
  },
  reminderLogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ReminderLog' 
  },
  scheduledTime: { type: Date },
  actualTime: { type: Date, default: Date.now },
  dosage: { type: String },
  status: { 
    type: String, 
    enum: ['taken', 'missed', 'skipped', 'partial'], 
    default: 'taken' 
  },
  notes: { type: String }
}, {
  timestamps: true
})

medicationLogSchema.index({ userId: 1 })
medicationLogSchema.index({ familyMemberId: 1 })
medicationLogSchema.index({ medicationId: 1 })
medicationLogSchema.index({ status: 1 })
medicationLogSchema.index({ createdAt: 1 })

export default mongoose.model('MedicationLog', medicationLogSchema)
