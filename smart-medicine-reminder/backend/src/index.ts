import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './database';
import FamilyMember from './models/FamilyMember';
import Medicine from './models/Medicine';
import Reminder from './models/Reminder';
import familyRoutes from './routes/familyRoutes';
import medicineRoutes from './routes/medicineRoutes';
import reminderRoutes from './routes/reminderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/family', familyRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/reminder', reminderRoutes);

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database connected and synchronized');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

startServer();