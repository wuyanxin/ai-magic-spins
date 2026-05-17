import mongoose from 'mongoose'
import crypto from 'crypto'

const familySchema = new mongoose.Schema({
  name: { type: String, required: [true, '家庭名称不能为空'], trim: true },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  inviteCode: { type: String, unique: true, sparse: true }
}, {
  timestamps: true
})

familySchema.index({ ownerId: 1 })
familySchema.index({ inviteCode: 1 })

familySchema.pre('save', function(next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase()
  }
  next()
})

familySchema.methods.regenerateInviteCode = function() {
  this.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase()
  return this.save()
}

export default mongoose.model('Family', familySchema)
