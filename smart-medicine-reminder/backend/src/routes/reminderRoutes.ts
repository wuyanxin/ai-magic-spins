import express from 'express';
import Reminder from '../models/Reminder';
import FamilyMember from '../models/FamilyMember';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate('medicineId')
      .populate('familyMemberId');
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('medicineId')
      .populate('familyMemberId');
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newReminder = new Reminder(req.body);
    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.post('/trigger/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('medicineId')
      .populate('familyMemberId');
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const familyMember = reminder.familyMemberId as any;
    if (familyMember.feishuUserId) {
      await sendFeishuMessage(familyMember.feishuUserId, reminder);
    }

    reminder.status = 'sent';
    await reminder.save();

    res.json({ message: 'Reminder sent successfully', reminder });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

async function sendFeishuMessage(userId: string, reminder: any) {
  const token = await getFeishuToken();
  const medicine = reminder.medicineId;
  
  const message = {
    user_id: userId,
    msg_type: 'text',
    content: {
      text: `\u63d0\u9192\uFF1A\u8BF7\u5403\u836F\uFF01\n\u836F\u54C1\uFF1A${medicine.name}\n\u65F6\u95F4\uFF1A${reminder.scheduledTime}\n\u91CF\uFF1A${medicine.schedules.map((s: any) => s.dosage).join(', ')}`
    }
  };

  await axios.post(
    'https://open.feishu.cn/open-apis/message/v4/send/',
    message,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function getFeishuToken(): Promise<string> {
  const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/', {
    app_id: process.env.FEISHU_APP_ID,
    app_secret: process.env.FEISHU_APP_SECRET
  });
  return response.data.tenant_access_token;
}

router.put('/:id', async (req, res) => {
  try {
    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json(updatedReminder);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedReminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!deletedReminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;