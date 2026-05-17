import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Typography, Fab,
  Card, CardContent, IconButton, Chip, Stack
} from '@mui/material';
import { Add, Edit, Delete, Person, Phone, Cake, FamilyRestroom } from '@mui/icons-material';
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
      await familyApi.update(editingMember.id, data);
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
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        家人管理
      </Typography>

      {familyMembers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Person sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            暂无家人信息
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            点击下方按钮添加家人
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            添加家人
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {familyMembers.map((member) => (
            <Card key={member.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      fontWeight: 'bold',
                      mr: 2
                    }}>
                      {member.name.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="h6">{member.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.relationship} · {member.gender === 'male' ? '男' : '女'} · {member.age}岁
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(member)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(member.id)}>
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip 
                    icon={<Phone />} 
                    label={member.phone} 
                    size="small" 
                    variant="outlined"
                  />
                  {member.feishuUserId && (
                    <Chip 
                      label="已绑定飞书" 
                      size="small" 
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>
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
          display: familyMembers.length === 0 ? 'none' : 'flex'
        }}
        onClick={() => handleOpen()}
      >
        <Add />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMember ? '编辑家人' : '添加家人'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="姓名"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="年龄"
              type="number"
              fullWidth
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>性别</InputLabel>
              <Select
                value={formData.gender}
                label="性别"
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              >
                <MenuItem value="male">男</MenuItem>
                <MenuItem value="female">女</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField
            margin="dense"
            label="电话"
            fullWidth
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="关系（如：父亲、母亲）"
            fullWidth
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="飞书用户ID（可选）"
            fullWidth
            value={formData.feishuUserId}
            onChange={(e) => setFormData({ ...formData, feishuUserId: e.target.value })}
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
