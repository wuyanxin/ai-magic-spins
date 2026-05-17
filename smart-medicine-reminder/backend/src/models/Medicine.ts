import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import FamilyMember from './FamilyMember';

export interface MedicineAttributes {
  id?: string;
  name: string;
  description?: string;
  type: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'other';
  schedules: string;
  familyMemberId: string;
  imageUrl?: string;
  notes?: string;
}

class Medicine extends Model<MedicineAttributes> implements MedicineAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public type!: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'other';
  public schedules!: string;
  public familyMemberId!: string;
  public imageUrl?: string;
  public notes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Medicine.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('tablet', 'capsule', 'liquid', 'injection', 'other'),
      allowNull: false,
    },
    schedules: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue('schedules');
        return JSON.parse(value);
      },
      set(value: any) {
        this.setDataValue('schedules', JSON.stringify(value));
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
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'medicines',
  }
);

Medicine.belongsTo(FamilyMember, { foreignKey: 'familyMemberId' });

export default Medicine;