import mongoose from 'mongoose'

const familyMemberSchema = new mongoose.Schema({
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: [true, '家庭ID不能为空'] 
  },
  name: { type: String, required: [true, '姓名不能为空'], trim: true },
  phone: { type: String, trim: true },
  age: { type: Number, min: 0, max: 150 },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other', ''] 
  },
  role: { 
    type: String, 
    enum: ['parent', 'member'], 
    default: 'member' 
  },
  healthConditions: [{ type: String }],
  allergies: [{ type: String }],
  avatar: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
})

familyMemberSchema.index({ familyId: 1 })
familyMemberSchema.index({ createdBy: 1 })

export default mongoose.model('FamilyMember', familyMemberSchema)
