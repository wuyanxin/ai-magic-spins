import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Medicine from './Medicine';
import FamilyMember from './FamilyMember';

export interface ReminderAttributes {
  id?: string;
  medicineId: string;
  familyMemberId: string;
  scheduledTime: Date;
  status?: 'pending' | 'sent' | 'confirmed' | 'cancelled';
  message?: string;
}

class Reminder extends Model<ReminderAttributes> implements ReminderAttributes {
  public id!: string;
  public medicineId!: string;
  public familyMemberId!: string;
  public scheduledTime!: Date;
  public status!: 'pending' | 'sent' | 'confirmed' | 'cancelled';
  public message?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Reminder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    medicineId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Medicine,
        key: 'id',
      },
    },
    familyMemberId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FamilyMember,
        key: 'id',
      },
    },
    scheduledTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'confirmed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'reminders',
  }
);

Reminder.belongsTo(Medicine, { foreignKey: 'medicineId' });
Reminder.belongsTo(FamilyMember, { foreignKey: 'familyMemberId' });

export default Reminder;