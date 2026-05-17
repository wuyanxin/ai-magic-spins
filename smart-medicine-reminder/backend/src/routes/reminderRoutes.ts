import express from 'express';
import Reminder from '../models/Reminder';
import Medicine from '../models/Medicine';
import FamilyMember from '../models/FamilyMember';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.findAll({ 
      include: [Medicine, FamilyMember] 
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByPk(req.params.id, { 
      include: [Medicine, FamilyMember] 
    });
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
    const newReminder = await Reminder.create(req.body);
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.post('/trigger/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByPk(req.params.id, { 
      include: [Medicine, FamilyMember] 
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const familyMember = (reminder as any).FamilyMember;
    if (familyMember && familyMember.feishuUserId) {
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
  const medicine = reminder.Medicine;
  
  const message = {
    user_id: userId,
    msg_type: 'text',
    content: {
      text: `\u63d0\u9192\uFF1A\u8BF7\u5403\u836F\uFF01\n\u836F\u54C1\uFF1A${medicine.name}\n\u65F6\u95F4\uFF1A${reminder.scheduledTime}\n\u91CF\uFF1A${JSON.parse(medicine.schedules).map((s: any) => s.dosage).join(', ')}`
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
    const [updated] = await Reminder.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    const updatedReminder = await Reminder.findByPk(req.params.id);
    res.json(updatedReminder);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reminder.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;