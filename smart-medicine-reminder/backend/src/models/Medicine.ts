import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicineSchedule {
  time: string;
  dosage: string;
}

export interface IMedicine extends Document {
  name: string;
  description?: string;
  type: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'other';
  schedules: IMedicineSchedule[];
  familyMemberId: mongoose.Types.ObjectId;
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineScheduleSchema: Schema = new Schema({
  time: { type: String, required: true },
  dosage: { type: String, required: true },
});

const MedicineSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['tablet', 'capsule', 'liquid', 'injection', 'other'], required: true },
  schedules: { type: [MedicineScheduleSchema], required: true },
  familyMemberId: { type: Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
  imageUrl: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IMedicine>('Medicine', MedicineSchema);