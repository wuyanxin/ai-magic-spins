<template>
  <div class="dashboard-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>MedReminder</h1>
          <div class="user-info">
            <span>欢迎，{{ user?.name || user?.email }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
        </div>
      </el-header>
      
      <el-container>
        <el-aside width="200px">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="dashboard">
              <el-icon><House /></el-icon>
              <span>首页概览</span>
            </el-menu-item>
            <el-menu-item index="family">
              <el-icon><User /></el-icon>
              <span>家人管理</span>
            </el-menu-item>
            <el-menu-item index="medications">
              <el-icon><Medicine /></el-icon>
              <span>药品管理</span>
            </el-menu-item>
            <el-menu-item index="reminders">
              <el-icon><Bell /></el-icon>
              <span>服药提醒</span>
            </el-menu-item>
            <el-menu-item index="consult">
              <el-icon><ChatDotRound /></el-icon>
              <span>用药咨询</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { House, User, Medicine, Bell, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const activeMenu = computed(() => {
  return route.name.toLowerCase()
})

const handleMenuSelect = (index) => {
  router.push(`/${index}`)
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

onMounted(async () => {
  if (!authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
}

.el-header {
  background-color: #409EFF;
  color: white;
  line-height: 60px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
