import mongoose, { Document, Schema } from 'mongoose';

export interface IFamilyMember extends Document {
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  feishuUserId?: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  phone: { type: String, required: true },
  feishuUserId: { type: String },
  relationship: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema);