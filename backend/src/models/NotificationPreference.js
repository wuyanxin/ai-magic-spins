import mongoose from 'mongoose'

const notificationPreferenceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  webPushEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: false },
  smsPhone: { type: String },
  emailEnabled: { type: Boolean, default: false },
  emailAddress: { type: String },
  quietHoursEnabled: { type: Boolean, default: true },
  quietHoursStart: { type: String, default: '22:00' },
  quietHoursEnd: { type: String, default: '07:00' },
  advanceNotice: { type: Number, default: 10 },
  repeatInterval: { type: Number, default: 5 }
}, {
  timestamps: true
})

notificationPreferenceSchema.index({ userId: 1 })

export default mongoose.model('NotificationPreference', notificationPreferenceSchema)
