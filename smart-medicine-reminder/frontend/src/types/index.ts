export interface FamilyMember {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  feishuUserId?: string;
  relationship: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineSchedule {
  _id?: string;
  time: string;
  dosage: string;
}

export interface Medicine {
  _id: string;
  name: string;
  description?: string;
  type: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'other';
  schedules: MedicineSchedule[];
  familyMemberId: string | FamilyMember;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  _id: string;
  medicineId: string | Medicine;
  familyMemberId: string | FamilyMember;
  scheduledTime: string;
  status?: 'pending' | 'sent' | 'confirmed' | 'cancelled';
  message?: string;
  createdAt: string;
  updatedAt: string;
}