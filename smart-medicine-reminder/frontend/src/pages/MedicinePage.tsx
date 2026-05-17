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
  Grid,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Tablet, PhotoCamera, TextFields } from '@mui/icons-material';
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
        schedules: medicine.schedules.length > 0 ? medicine.schedules : [{ time: '', dosage: '' }]
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
      familyMemberId: formData.familyMemberId
    };
    
    if (editingMedicine) {
      await medicineApi.update(editingMedicine._id, data);
    } else {
      await medicineApi.create(data);
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
    const id = typeof memberId === 'string' ? memberId : memberId._id;
    const member = familyMembers.find(m => m._id === id);
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
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">药品管理</Typography>
        <Box>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleSmartOpen}
            startIcon={<PhotoCamera />}
            sx={{ mr: 2 }}
          >
            智能添加
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleOpen()}
            startIcon={<Add />}
          >
            手动添加
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>药品名称</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>关联家人</TableCell>
              <TableCell>服用时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow key={medicine._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tablet sx={{ mr: 2 }} />
                    {medicine.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={getTypeName(medicine.type)} size="small" />
                </TableCell>
                <TableCell>{getMemberName(medicine.familyMemberId)}</TableCell>
                <TableCell>
                  <Box>
                    {medicine.schedules.map((s, i) => (
                      <Typography key={i} variant="body2">
                        {s.time} - {s.dosage}
                      </Typography>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(medicine)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(medicine._id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>{editingMedicine ? '编辑药品' : '手动添加药品'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="药品名称"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>药品类型</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <MenuItem value="tablet">片剂</MenuItem>
              <MenuItem value="capsule">胶囊</MenuItem>
              <MenuItem value="liquid">液体</MenuItem>
              <MenuItem value="injection">注射剂</MenuItem>
              <MenuItem value="other">其他</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>关联家人</InputLabel>
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>服用时间</Typography>
            {formData.schedules.map((schedule, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={5}>
                  <TextField
                    label="时间"
                    type="time"
                    value={schedule.time}
                    onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="剂量"
                    value={schedule.dosage}
                    onChange={(e) => handleScheduleChange(index, 'dosage', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    color="error"
                    disabled={formData.schedules.length === 1}
                    onClick={() => removeSchedule(index)}
                  >
                    删除
                  </Button>
                </Grid>
              </Grid>
            ))}
            <Button variant="outlined" onClick={addSchedule}>
              添加时间
            </Button>
          </Box>
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
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={smartOpen} onClose={handleSmartClose} maxWidth="md">
        <DialogTitle>智能添加药品</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            通过上传药品图片或输入药品文字信息，系统将自动识别药品信息和服用时间。
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              <PhotoCamera sx={{ mr: 1 }} />
              上传图片识别
            </Typography>
            <Button
              variant="contained"
              component="label"
              fullWidth
            >
              选择图片
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
            {smartData.imageData && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                图片已上传
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              <TextFields sx={{ mr: 1 }} />
              或输入文字描述
            </Typography>
            <TextField
              label="药品信息描述"
              multiline
              rows={4}
              fullWidth
              placeholder="请输入药品名称、规格、服用时间等信息..."
              value={smartData.textData}
              onChange={(e) => setSmartData({ ...smartData, textData: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSmartClose}>取消</Button>
          <Button onClick={handleSmartSubmit}>智能识别</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};