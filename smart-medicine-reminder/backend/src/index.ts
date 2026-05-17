import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import familyRoutes from './routes/familyRoutes';
import medicineRoutes from './routes/medicineRoutes';
import reminderRoutes from './routes/reminderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-medicine-reminder')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/family', familyRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/reminder', reminderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});