import mongoose from 'mongoose'

const medicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, '用户ID不能为空'] 
  },
  familyMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FamilyMember' 
  },
  name: { type: String, required: [true, '药品名称不能为空'], trim: true },
  specification: { type: String, trim: true },
  dosage: { type: String, trim: true },
  frequency: { type: String, trim: true },
  timing: { type: String, trim: true },
  duration: { type: String, trim: true },
  instructions: { type: String },
  notes: { type: String },
  source: { 
    type: String, 
    enum: ['manual', 'prescription'], 
    default: 'manual' 
  },
  prescriptionImage: { type: String },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date }
}, {
  timestamps: true
})

medicationSchema.index({ userId: 1 })
medicationSchema.index({ familyMemberId: 1 })
medicationSchema.index({ isActive: 1 })
medicationSchema.index({ expiryDate: 1 })

export default mongoose.model('Medication', medicationSchema)
