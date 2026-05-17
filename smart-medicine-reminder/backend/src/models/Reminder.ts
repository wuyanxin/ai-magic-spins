import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  medicineId: mongoose.Types.ObjectId;
  familyMemberId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'confirmed' | 'cancelled';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema({
  medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
  familyMemberId: { type: Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'confirmed', 'cancelled'], default: 'pending' },
  message: { type: String },
}, { timestamps: true });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);