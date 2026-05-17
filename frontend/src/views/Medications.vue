<template>
  <div class="medications-container">
    <div class="page-header">
      <h2>药品管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/medications/add')">
          添加药品
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部药品" name="all"></el-tab-pane>
      <el-tab-pane label="进行中" name="active"></el-tab-pane>
      <el-tab-pane label="已停用" name="inactive"></el-tab-pane>
    </el-tabs>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="med in medications" :key="med._id">
        <el-card class="medication-card" shadow="hover">
          <template #header>
            <div class="medication-header">
              <div class="med-info">
                <h3>{{ med.name }}</h3>
                <el-tag v-if="med.source === 'prescription'" type="success" size="small">
                  处方
                </el-tag>
              </div>
              <el-switch
                v-model="med.isActive"
                @change="handleToggleActive(med)"
              />
            </div>
          </template>
          <div class="medication-details">
            <p v-if="med.specification"><strong>规格：</strong>{{ med.specification }}</p>
            <p v-if="med.dosage"><strong>剂量：</strong>{{ med.dosage }}</p>
            <p v-if="med.frequency"><strong>频率：</strong>{{ med.frequency }}</p>
            <p v-if="med.timing"><strong>时间：</strong>{{ med.timing }}</p>
            <p v-if="med.notes"><strong>说明：</strong>{{ med.notes }}</p>
            <p v-if="med.familyMemberId"><strong>服用人：</strong>{{ med.familyMemberId.name }}</p>
          </div>
          <div class="medication-actions">
            <el-button size="small" type="primary" @click="viewSchedules(med)">
              查看计划
            </el-button>
            <el-button size="small" @click="handleEdit(med)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(med._id)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="medications.length === 0" description="暂无药品，点击添加按钮添加">
      <el-button type="primary" @click="$router.push('/medications/add')">添加药品</el-button>
    </el-empty>

    <el-dialog v-model="showScheduleDialog" title="用药计划" width="600px">
      <el-timeline v-if="schedules.length > 0">
        <el-timeline-item
          v-for="schedule in schedules"
          :key="schedule._id"
          :timestamp="schedule.scheduleType === 'daily' ? '每天' : schedule.scheduleType === 'weekly' ? '每周' : '自定义'"
          placement="top"
        >
          <el-card>
            <h4>{{ schedule.medicationId?.name }}</h4>
            <p><strong>提醒时间：</strong>{{ schedule.times?.join(', ') }}</p>
            <p><strong>开始日期：</strong>{{ formatDate(schedule.startDate) }}</p>
            <p v-if="schedule.endDate"><strong>结束日期：</strong>{{ formatDate(schedule.endDate) }}</p>
            <p>
              <strong>状态：</strong>
              <el-tag :type="schedule.isActive ? 'success' : 'info'" size="small">
                {{ schedule.isActive ? '启用' : '停用' }}
              </el-tag>
            </p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无用药计划">
        <el-button type="primary" size="small" @click="goToAddSchedule">添加计划</el-button>
      </el-empty>
      <template #footer>
        <el-button @click="showScheduleDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../services/api'
import dayjs from 'dayjs'

const router = useRouter()

const medications = ref([])
const activeTab = ref('all')
const showScheduleDialog = ref(false)
const schedules = ref([])
const selectedMedication = ref(null)

const fetchMedications = async () => {
  try {
    const params = {}
    if (activeTab.value === 'active') {
      params.isActive = 'true'
    } else if (activeTab.value === 'inactive') {
      params.isActive = 'false'
    }
    
    const response = await api.get('/medications', { params })
    medications.value = response.data
  } catch (error) {
    ElMessage.error('获取药品列表失败')
  }
}

const handleTabChange = () => {
  fetchMedications()
}

const handleToggleActive = async (med) => {
  try {
    await api.put(`/medications/${med._id}`, { isActive: med.isActive })
    ElMessage.success(`药品已${med.isActive ? '启用' : '停用'}`)
  } catch (error) {
    med.isActive = !med.isActive
    ElMessage.error('更新失败')
  }
}

const viewSchedules = async (med) => {
  selectedMedication.value = med
  try {
    const response = await api.get('/medications/schedules', {
      params: { medicationId: med._id }
    })
    schedules.value = response.data
    showScheduleDialog.value = true
  } catch (error) {
    ElMessage.error('获取用药计划失败')
  }
}

const handleEdit = (med) => {
  router.push({ path: '/medications/add', query: { id: med._id } })
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该药品吗？相关用药计划也会被删除。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete(`/medications/${id}`)
    ElMessage.success('药品删除成功')
    fetchMedications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const goToAddSchedule = () => {
  showScheduleDialog.value = false
  router.push({ path: '/medications/add', query: { id: selectedMedication.value._id } })
}

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

onMounted(() => {
  fetchMedications()
})
</script>

<style scoped>
.medications-container {
  max-width: 1200px;
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

.medication-card {
  margin-bottom: 20px;
}

.medication-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.med-info h3 {
  margin: 0 0 5px 0;
}

.medication-details {
  margin: 15px 0;
}

.medication-details p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.medication-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
