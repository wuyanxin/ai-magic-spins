<template>
  <div class="reminders-container">
    <div class="page-header">
      <h2>服药提醒</h2>
      <div class="header-actions">
        <el-button @click="showNotificationDialog = true">
          通知设置
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="待服药" name="pending">
        <template #label>
          待服药
          <el-badge :value="pendingCount" :hidden="pendingCount === 0" />
        </template>
      </el-tab-pane>
      <el-tab-pane label="已服药" name="taken" />
      <el-tab-pane label="服药历史" name="history" />
      <el-tab-pane label="统计" name="statistics" />
    </el-tabs>

    <div v-if="activeTab === 'pending'">
      <el-empty v-if="pendingReminders.length === 0" description="暂无待服药提醒" />
      <el-card v-for="reminder in pendingReminders" :key="reminder._id" class="reminder-card">
        <div class="reminder-content">
          <div class="reminder-info">
            <h3>{{ reminder.medicationId?.name }}</h3>
            <p class="dosage">{{ reminder.medicationId?.dosage || '请遵医嘱' }}</p>
            <p class="time">计划时间：{{ formatTime(reminder.scheduledTime) }}</p>
            <p v-if="reminder.familyMemberId" class="member">
              服用人：{{ reminder.familyMemberId.name }}
            </p>
          </div>
          <div class="reminder-actions">
            <el-button type="success" size="large" @click="confirmTake(reminder)">
              确认服药
            </el-button>
            <el-button size="large" @click="skipReminder(reminder)">跳过</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="activeTab === 'taken'">
      <el-timeline>
        <el-timeline-item
          v-for="reminder in takenReminders"
          :key="reminder._id"
          :timestamp="formatTime(reminder.takenTime)"
          :color="reminder.status === 'taken' ? '#67C23A' : '#909399'"
        >
          <el-card>
            <h4>{{ reminder.medicationId?.name }}</h4>
            <p>服用时间：{{ formatTime(reminder.takenTime) }}</p>
            <p>响应时间：{{ formatDuration(reminder.responseTime) }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="takenReminders.length === 0" description="暂无已服药记录" />
    </div>

    <div v-if="activeTab === 'history'">
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-statistic title="总服药次数" :value="statistics.total" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="已服药" :value="statistics.taken" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="服药依从率" :value="statistics.adherenceRate" suffix="%" />
        </el-col>
      </el-row>

      <el-table :data="historyLogs" stripe>
        <el-table-column prop="medicationId.name" label="药品名称" />
        <el-table-column prop="familyMemberId.name" label="服用人" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualTime" label="实际时间">
          <template #default="{ row }">
            {{ formatTime(row.actualTime) }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="totalLogs > 0"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalLogs"
        layout="prev, pager, next"
        @current-change="fetchHistory"
        style="margin-top: 20px; text-align: center"
      />
    </div>

    <div v-if="activeTab === 'statistics'">
      <el-card>
        <template #header>
          <h3>服药统计</h3>
        </template>
        <div id="statisticsChart" style="width: 100%; height: 400px"></div>
      </el-card>
    </div>

    <el-dialog v-model="showNotificationDialog" title="通知设置" width="500px">
      <el-form :model="notificationSettings" label-width="120px">
        <el-form-item label="Web Push通知">
          <el-switch v-model="notificationSettings.webPushEnabled" />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="notificationSettings.smsEnabled" />
        </el-form-item>
        <el-form-item v-if="notificationSettings.smsEnabled" label="手机号">
          <el-input v-model="notificationSettings.smsPhone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮件通知">
          <el-switch v-model="notificationSettings.emailEnabled" />
        </el-form-item>
        <el-form-item v-if="notificationSettings.emailEnabled" label="邮箱">
          <el-input v-model="notificationSettings.emailAddress" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="免打扰时段">
          <el-switch v-model="notificationSettings.quietHoursEnabled" />
        </el-form-item>
        <el-form-item v-if="notificationSettings.quietHoursEnabled" label="时段范围">
          <el-time-select
            v-model="notificationSettings.quietHoursStart"
            placeholder="开始时间"
            start="00:00"
            step="00:30"
            end="12:00"
          />
          ~
          <el-time-select
            v-model="notificationSettings.quietHoursEnd"
            placeholder="结束时间"
            start="06:00"
            step="00:30"
            end="23:30"
          />
        </el-form-item>
        <el-form-item label="提前提醒">
          <el-input-number
            v-model="notificationSettings.advanceNotice"
            :min="0"
            :max="60"
          />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testNotification">测试通知</el-button>
        <el-button @click="showNotificationDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNotificationSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../services/api'
import dayjs from 'dayjs'

const activeTab = ref('pending')
const pendingReminders = ref([])
const takenReminders = ref([])
const historyLogs = ref([])
const statistics = ref({
  total: 0,
  taken: 0,
  missed: 0,
  skipped: 0,
  adherenceRate: 0
})
const currentPage = ref(1)
const pageSize = ref(10)
const totalLogs = ref(0)
const showNotificationDialog = ref(false)
const notificationSettings = ref({
  webPushEnabled: true,
  smsEnabled: false,
  smsPhone: '',
  emailEnabled: false,
  emailAddress: '',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  advanceNotice: 10
})

const pendingCount = computed(() => pendingReminders.value.length)

const fetchPendingReminders = async () => {
  try {
    const response = await api.get('/reminders/logs', {
      params: { status: 'pending', limit: 50 }
    })
    pendingReminders.value = response.data.logs || []
  } catch (error) {
    console.error('Failed to fetch pending reminders:', error)
  }
}

const fetchTakenReminders = async () => {
  try {
    const response = await api.get('/reminders/logs', {
      params: { status: 'taken', limit: 20 }
    })
    takenReminders.value = response.data.logs || []
  } catch (error) {
    console.error('Failed to fetch taken reminders:', error)
  }
}

const fetchHistory = async () => {
  try {
    const response = await api.get('/reminders/history', {
      params: { page: currentPage.value, limit: pageSize.value }
    })
    historyLogs.value = response.data.logs || []
    totalLogs.value = response.data.pagination?.total || 0
  } catch (error) {
    console.error('Failed to fetch history:', error)
  }
}

const fetchStatistics = async () => {
  try {
    const response = await api.get('/reminders/statistics')
    statistics.value = response.data
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

const fetchNotificationSettings = async () => {
  try {
    const response = await api.get('/reminders/notifications/preferences')
    notificationSettings.value = { ...notificationSettings.value, ...response.data }
  } catch (error) {
    console.error('Failed to fetch notification settings:', error)
  }
}

const confirmTake = async (reminder) => {
  try {
    await api.put(`/reminders/logs/${reminder._id}/confirm`)
    ElMessage.success('服药确认成功')
    fetchPendingReminders()
    fetchTakenReminders()
  } catch (error) {
    ElMessage.error('确认失败')
  }
}

const skipReminder = async (reminder) => {
  try {
    await api.put(`/reminders/logs/${reminder._id}/skip`)
    ElMessage.success('已跳过')
    fetchPendingReminders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const saveNotificationSettings = async () => {
  try {
    await api.put('/reminders/notifications/preferences', notificationSettings.value)
    ElMessage.success('通知设置已保存')
    showNotificationDialog.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const testNotification = async () => {
  try {
    await api.post('/reminders/notifications/test', { type: 'webpush' })
    ElMessage.success('测试通知已发送')
  } catch (error) {
    ElMessage.error('发送失败')
  }
}

const formatTime = (time) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
}

const formatDuration = (seconds) => {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

const getStatusType = (status) => {
  const types = {
    taken: 'success',
    missed: 'danger',
    skipped: 'info',
    partial: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    taken: '已服药',
    missed: '漏服',
    skipped: '跳过',
    partial: '部分服药'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchPendingReminders()
  fetchNotificationSettings()
})

activeTab.value = 'pending'
</script>

<style scoped>
.reminders-container {
  max-width: 1000px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.reminder-card {
  margin-bottom: 15px;
}

.reminder-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reminder-info h3 {
  margin: 0 0 10px 0;
}

.reminder-info p {
  margin: 5px 0;
  color: #606266;
}

.reminder-info .time {
  color: #409EFF;
  font-weight: bold;
}

.reminder-actions {
  display: flex;
  gap: 10px;
}
</style>
