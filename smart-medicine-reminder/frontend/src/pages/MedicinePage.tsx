import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Typography, Fab,
  Card, CardContent, IconButton, Chip, Stack, Grid
} from '@mui/material';
import { Add, Edit, Delete, Tablet, PhotoCamera, TextFields, Schedule } from '@mui/icons-material';
import { Medicine, FamilyMember, MedicineSchedule } from '../types';
import { medicineApi, familyApi } from '../api';

export const MedicinePage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [open, setOpen] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'tablet' as 'tablet' | 'capsule' | 'liquid' | 'injection' | 'other',
    familyMemberId: '',
    notes: '',
    schedules: [{ time: '', dosage: '' }] as MedicineSchedule[]
  });
  const [smartData, setSmartData] = useState({
    imageData: '',
    textData: ''
  });

  useEffect(() => {
    fetchMedicines();
    fetchFamilyMembers();
  }, []);

  const fetchMedicines = async () => {
    const meds = await medicineApi.getAll();
    setMedicines(meds);
  };

  const fetchFamilyMembers = async () => {
    const members = await familyApi.getAll();
    setFamilyMembers(members);
  };

  const handleOpen = (medicine?: Medicine) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name,
        description: medicine.description || '',
        type: medicine.type,
        familyMemberId: typeof medicine.familyMemberId === 'string' ? medicine.familyMemberId : '',
        notes: medicine.notes || '',
        schedules: Array.isArray(medicine.schedules) && medicine.schedules.length > 0 
          ? medicine.schedules 
          : [{ time: '', dosage: '' }]
      });
    } else {
      setEditingMedicine(null);
      setFormData({
        name: '',
        description: '',
        type: 'tablet',
        familyMemberId: '',
        notes: '',
        schedules: [{ time: '', dosage: '' }]
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMedicine(null);
  };

  const handleSmartOpen = () => {
    setSmartOpen(true);
  };

  const handleSmartClose = () => {
    setSmartOpen(false);
    setSmartData({ imageData: '', textData: '' });
  };

  const handleScheduleChange = (index: number, field: 'time' | 'dosage', value: string) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setFormData({ ...formData, schedules: newSchedules });
  };

  const addSchedule = () => {
    setFormData({ ...formData, schedules: [...formData.schedules, { time: '', dosage: '' }] });
  };

  const removeSchedule = (index: number) => {
    if (formData.schedules.length > 1) {
      const newSchedules = formData.schedules.filter((_, i) => i !== index);
      setFormData({ ...formData, schedules: newSchedules });
    }
  };

  const handleSubmit = async () => {
    if (!formData.familyMemberId) {
      alert('请选择关联的家人');
      return;
    }

    const data = {
      ...formData,
      schedules: JSON.stringify(formData.schedules)
    };
    
    if (editingMedicine) {
      await medicineApi.update(editingMedicine.id, data as any);
    } else {
      await medicineApi.create(data as any);
    }
    
    fetchMedicines();
    handleClose();
  };

  const handleSmartSubmit = async () => {
    await medicineApi.smartAdd(smartData);
    fetchMedicines();
    handleSmartClose();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该药品吗？')) {
      await medicineApi.delete(id);
      fetchMedicines();
    }
  };

  const getMemberName = (memberId: string | FamilyMember) => {
    const id = typeof memberId === 'string' ? memberId : memberId.id;
    const member = familyMembers.find(m => m.id === id);
    return member?.name || '未知';
  };

  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      tablet: '片剂',
      capsule: '胶囊',
      liquid: '液体',
      injection: '注射剂',
      other: '其他'
    };
    return types[type] || type;
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        药品管理
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          color="secondary"
          fullWidth
          size="large"
          startIcon={<PhotoCamera />}
          onClick={handleSmartOpen}
          sx={{ py: 1.5 }}
        >
          智能添加
        </Button>
        <Button 
          variant="outlined" 
          fullWidth
          size="large"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ py: 1.5 }}
        >
          手动添加
        </Button>
      </Stack>

      {medicines.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Tablet sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            暂无药品信息
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            点击上方按钮添加药品
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {medicines.map((medicine) => (
            <Card key={medicine.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flex: 1 }}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      '& svg': { fontSize: 28 }
                    }}>
                      <Tablet />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{medicine.name}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip label={getTypeName(medicine.type)} size="small" />
                        <Typography variant="body2" color="textSecondary">
                          服用人：{getMemberName(medicine.familyMemberId)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(medicine)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(medicine.id)}>
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">服用时间</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {Array.isArray(medicine.schedules) && medicine.schedules.map((s: any, i: number) => (
                      <Chip
                        key={i}
                        label={`${s.time} - ${s.dosage}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMedicine ? '编辑药品' : '手动添加药品'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="药品名称"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>药品类型</InputLabel>
            <Select
              value={formData.type}
              label="药品类型"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <MenuItem value="tablet">片剂</MenuItem>
              <MenuItem value="capsule">胶囊</MenuItem>
              <MenuItem value="liquid">液体</MenuItem>
              <MenuItem value="injection">注射剂</MenuItem>
              <MenuItem value="other">其他</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>关联家人</InputLabel>
            <Select
              value={formData.familyMemberId}
              label="关联家人"
              onChange={(e) => setFormData({ ...formData, familyMemberId: e.target.value })}
            >
              {familyMembers.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>服用时间</Typography>
          {formData.schedules.map((schedule, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                type="time"
                size="small"
                value={schedule.time}
                onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                placeholder="剂量"
                value={schedule.dosage}
                onChange={(e) => handleScheduleChange(index, 'dosage', e.target.value)}
                sx={{ flex: 1 }}
              />
              {formData.schedules.length > 1 && (
                <IconButton size="small" onClick={() => removeSchedule(index)}>
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
          <Button size="small" onClick={addSchedule} sx={{ mb: 2 }}>添加时间</Button>

          <TextField
            margin="dense"
            label="备注"
            fullWidth
            multiline
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} fullWidth>取消</Button>
          <Button onClick={handleSubmit} variant="contained" fullWidth>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={smartOpen} onClose={handleSmartClose} maxWidth="sm" fullWidth>
        <DialogTitle>智能添加药品</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            通过上传药品图片或输入药品文字信息，系统将自动识别药品信息和服用时间。
          </Typography>
          
          <Button
            variant="outlined"
            fullWidth
            component="label"
            startIcon={<PhotoCamera />}
            sx={{ mb: 3, py: 1.5 }}
          >
            {smartData.imageData ? '图片已选择' : '上传药品图片'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setSmartData({ ...smartData, imageData: event.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Button>

          <Typography variant="body2" sx={{ mb: 1 }}>或输入文字描述</Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="请输入药品名称、规格、服用时间等信息..."
            value={smartData.textData}
            onChange={(e) => setSmartData({ ...smartData, textData: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleSmartClose} fullWidth>取消</Button>
          <Button onClick={handleSmartSubmit} variant="contained" fullWidth>智能识别</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
