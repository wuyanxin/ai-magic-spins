import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';

export interface FamilyMemberAttributes {
  id?: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  feishuUserId?: string;
  relationship: string;
}

class FamilyMember extends Model<FamilyMemberAttributes> implements FamilyMemberAttributes {
  public id!: string;
  public name!: string;
  public age!: number;
  public gender!: 'male' | 'female';
  public phone!: string;
  public feishuUserId?: string;
  public relationship!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FamilyMember.init(
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
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feishuUserId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    relationship: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'family_members',
  }
);

export default FamilyMember;