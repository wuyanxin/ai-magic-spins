import mongoose from 'mongoose'

const reminderLogSchema = new mongoose.Schema({
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MedicationSchedule', 
    required: [true, '用药计划ID不能为空'] 
  },
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
  scheduledTime: { type: Date, required: [true, '计划提醒时间不能为空'] },
  reminderTime: { type: Date },
  notificationSent: {
    webPush: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['pending', 'taken', 'missed', 'skipped'], 
    default: 'pending' 
  },
  takenTime: { type: Date },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responseTime: { type: Number },
  notes: { type: String }
}, {
  timestamps: true
})

reminderLogSchema.index({ scheduleId: 1 })
reminderLogSchema.index({ medicationId: 1 })
reminderLogSchema.index({ familyMemberId: 1 })
reminderLogSchema.index({ userId: 1 })
reminderLogSchema.index({ status: 1 })
reminderLogSchema.index({ scheduledTime: 1 })
reminderLogSchema.index({ createdAt: 1 })

export default mongoose.model('ReminderLog', reminderLogSchema)
