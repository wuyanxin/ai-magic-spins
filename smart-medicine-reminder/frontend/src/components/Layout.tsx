import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { 
  Home, 
  People, 
  Tablet, 
  Notifications, 
  Menu as MenuIcon 
} from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="static">
        <Toolbar>
          <MenuIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            智能服药提醒系统
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => onPageChange('home')}
            startIcon={<Home />}
          >
            首页
          </Button>
          <Button 
            color="inherit" 
            onClick={() => onPageChange('family')}
            startIcon={<People />}
          >
            家人管理
          </Button>
          <Button 
            color="inherit" 
            onClick={() => onPageChange('medicine')}
            startIcon={<Tablet />}
          >
            药品管理
          </Button>
          <Button 
            color="inherit" 
            onClick={() => onPageChange('reminder')}
            startIcon={<Notifications />}
          >
            提醒管理
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};