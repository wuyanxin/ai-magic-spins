import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Paper } from '@mui/material';
import { People, Tablet, Notifications, TrendingUp, Add } from '@mui/icons-material';

interface HomePageProps {
  familyCount: number;
  medicineCount: number;
  reminderCount: number;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  familyCount, 
  medicineCount, 
  reminderCount,
  onNavigate 
}) => {
  const stats = [
    { label: '家人数量', value: familyCount, icon: <People />, color: '#1976d2', path: 'family' },
    { label: '药品数量', value: medicineCount, icon: <Tablet />, color: '#4caf50', path: 'medicine' },
    { label: '提醒数量', value: reminderCount, icon: <Notifications />, color: '#ff9800', path: 'reminder' },
    { label: '按时服药率', value: '100%', icon: <TrendingUp />, color: '#9c27b0', path: '' },
  ];

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        欢迎使用服药提醒系统
      </Typography>

      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Card 
              onClick={() => stat.path && onNavigate(stat.path)}
              sx={{ 
                cursor: stat.path ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': stat.path ? { transform: 'scale(1.02)' } : {},
                height: '100%'
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ color: stat.color, mb: 1, '& svg': { fontSize: 40 } }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>快速操作</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              startIcon={<Add />}
              onClick={() => onNavigate('family')}
              sx={{ py: 1.5 }}
            >
              添加家人
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="outlined" 
              fullWidth
              size="large"
              startIcon={<Tablet />}
              onClick={() => onNavigate('medicine')}
              sx={{ py: 1.5 }}
            >
              添加药品
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="text" 
              fullWidth
              size="large"
              startIcon={<Notifications />}
              onClick={() => onNavigate('reminder')}
              sx={{ py: 1.5 }}
            >
              管理提醒
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>系统说明</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          本系统帮助您管理家人的服药提醒，支持智能识别药品信息，自动发送服药提醒到飞书。
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>主要功能：</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>管理家人信息，绑定飞书账号</li>
            <li>手动或智能添加药品信息</li>
            <li>设置服药提醒，自动发送通知</li>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
