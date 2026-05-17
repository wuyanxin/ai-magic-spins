import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Notifications, Send, Schedule } from '@mui/icons-material';
import { Reminder, Medicine, FamilyMember } from '../types';
import { reminderApi, medicineApi, familyApi } from '../api';

export const ReminderPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    medicineId: '',
    familyMemberId: '',
    scheduledTime: '',
    message: ''
  });
  const [triggerMessage, setTriggerMessage] = useState('');

  useEffect(() => {
    fetchReminders();
    fetchMedicines();
    fetchFamilyMembers();
  }, []);

  const fetchReminders = async () => {
    const rems = await reminderApi.getAll();
    setReminders(rems);
  };

  const fetchMedicines = async () => {
    const meds = await medicineApi.getAll();
    setMedicines(meds);
  };

  const fetchFamilyMembers = async () => {
    const members = await familyApi.getAll();
    setFamilyMembers(members);
  };

  const handleOpen = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        medicineId: typeof reminder.medicineId === 'string' ? reminder.medicineId : '',
        familyMemberId: typeof reminder.familyMemberId === 'string' ? reminder.familyMemberId : '',
        scheduledTime: new Date(reminder.scheduledTime).toISOString().slice(0, 16),
        message: reminder.message || ''
      });
    } else {
      setEditingReminder(null);
      setFormData({
        medicineId: '',
        familyMemberId: '',
        scheduledTime: '',
        message: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingReminder(null);
    setTriggerMessage('');
  };

  const handleSubmit = async () => {
    if (!formData.medicineId || !formData.familyMemberId || !formData.scheduledTime) {
      alert('请填写完整信息');
      return;
    }

    const data = {
      ...formData,
      scheduledTime: new Date(formData.scheduledTime).toISOString()
    };
    
    if (editingReminder) {
      await reminderApi.update(editingReminder._id, data);
    } else {
      await reminderApi.create(data);
    }
    
    fetchReminders();
    handleClose();
  };

  const handleTrigger = async (id: string) => {
    try {
      const result = await reminderApi.trigger(id);
      setTriggerMessage(result.message);
      fetchReminders();
      setTimeout(() => setTriggerMessage(''), 3000);
    } catch (error) {
      setTriggerMessage('发送失败，请检查飞书配置');
      setTimeout(() => setTriggerMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该提醒吗？')) {
      await reminderApi.delete(id);
      fetchReminders();
    }
  };

  const getMedicineName = (medicineId: string | Medicine) => {
    const id = typeof medicineId === 'string' ? medicineId : medicineId._id;
    const medicine = medicines.find(m => m._id === id);
    return medicine?.name || '未知';
  };

  const getMemberName = (memberId: string | FamilyMember) => {
    const id = typeof memberId === 'string' ? memberId : memberId._id;
    const member = familyMembers.find(m => m._id === id);
    return member?.name || '未知';
  };

  const getStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      pending: '待发送',
      sent: '已发送',
      confirmed: '已确认',
      cancelled: '已取消'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      sent: 'primary',
      confirmed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      {triggerMessage && (
        <Alert severity={triggerMessage.includes('失败') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {triggerMessage}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">提醒管理</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpen()}
          startIcon={<Add />}
        >
          添加提醒
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>药品</TableCell>
              <TableCell>提醒对象</TableCell>
              <TableCell>提醒时间</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reminders.map((reminder) => (
              <TableRow key={reminder._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Notifications sx={{ mr: 2 }} />
                    {getMedicineName(reminder.medicineId)}
                  </Box>
                </TableCell>
                <TableCell>{getMemberName(reminder.familyMemberId)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 1 }} />
                    {formatTime(reminder.scheduledTime)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusName(reminder.status || 'pending')} 
                    color={getStatusColor(reminder.status || 'pending') as any} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(reminder)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleTrigger(reminder._id)}
                    disabled={(reminder.status || 'pending') === 'sent'}
                  >
                    <Send color={(reminder.status || 'pending') === 'sent' ? 'disabled' : 'secondary'} />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(reminder._id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>{editingReminder ? '编辑提醒' : '添加提醒'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>选择药品</InputLabel>
            <Select
              value={formData.medicineId}
              onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
            >
              {medicines.map(medicine => (
                <MenuItem key={medicine._id} value={medicine._id}>
                  {medicine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>选择提醒对象</InputLabel>
            <Select
              value={formData.familyMemberId}
              onChange={(e) => setFormData({ ...formData, familyMemberId: e.target.value })}
            >
              {familyMembers.map(member => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="提醒时间"
            type="datetime-local"
            fullWidth
            value={formData.scheduledTime}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
          />
          <TextField
            margin="dense"
            label="自定义消息（可选）"
            fullWidth
            multiline
            rows={2}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};