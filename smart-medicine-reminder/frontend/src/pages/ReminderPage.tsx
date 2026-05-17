import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Typography, Fab,
  Card, CardContent, IconButton, Chip, Stack, Alert
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
      await reminderApi.update(editingReminder.id, data);
    } else {
      await reminderApi.create(data as any);
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
    const id = typeof medicineId === 'string' ? medicineId : medicineId.id;
    const medicine = medicines.find(m => m.id === id);
    return medicine?.name || '未知';
  };

  const getMemberName = (memberId: string | FamilyMember) => {
    const id = typeof memberId === 'string' ? memberId : memberId.id;
    const member = familyMembers.find(m => m.id === id);
    return member?.name || '未知';
  };

  const getStatusName = (status?: string) => {
    const statuses: Record<string, string> = {
      pending: '待发送',
      sent: '已发送',
      confirmed: '已确认',
      cancelled: '已取消'
    };
    return statuses[status || 'pending'] || '待发送';
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      pending: 'warning',
      sent: 'primary',
      confirmed: 'success',
      cancelled: 'error'
    };
    return colors[status || 'pending'] || 'warning';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        提醒管理
      </Typography>

      {triggerMessage && (
        <Alert severity={triggerMessage.includes('失败') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {triggerMessage}
        </Alert>
      )}

      {reminders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Notifications sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            暂无提醒
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            点击下方按钮创建提醒
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            添加提醒
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flex: 1 }}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      bgcolor: 'warning.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      '& svg': { fontSize: 28 }
                    }}>
                      <Notifications />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{getMedicineName(reminder.medicineId)}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip 
                          label={getStatusName(reminder.status)} 
                          size="small" 
                          color={getStatusColor(reminder.status) as any}
                        />
                        <Typography variant="body2" color="textSecondary">
                          服用人：{getMemberName(reminder.familyMemberId)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(reminder)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(reminder.id)}>
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'background.default', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {formatTime(reminder.scheduledTime)}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={(reminder.status || 'pending') === 'sent'}
                    onClick={() => handleTrigger(reminder.id)}
                  >
                    发送
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Fab 
        color="primary" 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          display: reminders.length === 0 ? 'none' : 'flex'
        }}
        onClick={() => handleOpen()}
      >
        <Add />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingReminder ? '编辑提醒' : '添加提醒'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>选择药品</InputLabel>
            <Select
              value={formData.medicineId}
              label="选择药品"
              onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
            >
              {medicines.map(medicine => (
                <MenuItem key={medicine.id} value={medicine.id}>
                  {medicine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>选择提醒对象</InputLabel>
            <Select
              value={formData.familyMemberId}
              label="选择提醒对象"
              onChange={(e) => setFormData({ ...formData, familyMemberId: e.target.value })}
            >
              {familyMembers.map(member => (
                <MenuItem key={member.id} value={member.id}>
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
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} fullWidth>取消</Button>
          <Button onClick={handleSubmit} variant="contained" fullWidth>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
