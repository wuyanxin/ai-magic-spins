import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { People, Tablet, Notifications, TrendingUp } from '@mui/icons-material';

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
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        欢迎使用智能服药提醒系统
      </Typography>
      <Typography variant="body1" color="textSecondary" component="p">
        本系统帮助您管理家人的服药提醒，支持智能识别药品信息，自动发送服药提醒。
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card onClick={() => onNavigate('family')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Box>
                  <Typography variant="h5">{familyCount}</Typography>
                  <Typography variant="body2" color="textSecondary">家人数量</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card onClick={() => onNavigate('medicine')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tablet sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Box>
                  <Typography variant="h5">{medicineCount}</Typography>
                  <Typography variant="body2" color="textSecondary">药品数量</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card onClick={() => onNavigate('reminder')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Notifications sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Box>
                  <Typography variant="h5">{reminderCount}</Typography>
                  <Typography variant="body2" color="textSecondary">提醒数量</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
                <Box>
                  <Typography variant="h5">100%</Typography>
                  <Typography variant="body2" color="textSecondary">按时服药率</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>快速操作</Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => onNavigate('family')}
            >
              添加家人
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={() => onNavigate('medicine')}
            >
              添加药品
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              onClick={() => onNavigate('reminder')}
            >
              管理提醒
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};