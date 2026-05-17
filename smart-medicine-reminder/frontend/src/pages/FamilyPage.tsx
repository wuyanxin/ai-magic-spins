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
  Box
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { FamilyMember } from '../types';
import { familyApi } from '../api';

export const FamilyPage: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    feishuUserId: '',
    relationship: ''
  });

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    const members = await familyApi.getAll();
    setFamilyMembers(members);
  };

  const handleOpen = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        age: String(member.age),
        gender: member.gender,
        phone: member.phone,
        feishuUserId: member.feishuUserId || '',
        relationship: member.relationship
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        age: '',
        gender: 'male',
        phone: '',
        feishuUserId: '',
        relationship: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMember(null);
  };

  const handleSubmit = async () => {
    const data = {
      ...formData,
      age: Number(formData.age)
    };
    
    if (editingMember) {
      await familyApi.update(editingMember._id, data);
    } else {
      await familyApi.create(data);
    }
    
    fetchFamilyMembers();
    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该家人吗？')) {
      await familyApi.delete(id);
      fetchFamilyMembers();
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">家人管理</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpen()}
          startIcon={<Add />}
        >
          添加家人
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>年龄</TableCell>
              <TableCell>性别</TableCell>
              <TableCell>电话</TableCell>
              <TableCell>关系</TableCell>
              <TableCell>飞书ID</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {familyMembers.map((member) => (
              <TableRow key={member._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 2 }} />
                    {member.name}
                  </Box>
                </TableCell>
                <TableCell>{member.age}</TableCell>
                <TableCell>{member.gender === 'male' ? '男' : '女'}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.relationship}</TableCell>
                <TableCell>{member.feishuUserId || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(member)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(member._id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingMember ? '编辑家人' : '添加家人'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="姓名"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="年龄"
            type="number"
            fullWidth
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>性别</InputLabel>
            <Select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
            >
              <MenuItem value="male">男</MenuItem>
              <MenuItem value="female">女</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="电话"
            fullWidth
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="关系"
            fullWidth
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          />
          <TextField
            margin="dense"
            label="飞书用户ID（可选）"
            fullWidth
            value={formData.feishuUserId}
            onChange={(e) => setFormData({ ...formData, feishuUserId: e.target.value })}
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