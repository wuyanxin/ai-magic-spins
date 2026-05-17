<template>
  <div class="add-medication-container">
    <el-page-header @back="$router.back()" content="添加药品" />
    
    <el-steps :active="currentStep" align-center style="margin: 30px 0">
      <el-step title="选择添加方式" />
      <el-step title="填写药品信息" />
      <el-step title="设置用药计划" />
    </el-steps>

    <el-card v-if="currentStep === 0">
      <template #header>
        <h3>选择添加方式</h3>
      </template>
      <div class="method-selection">
        <el-row :gutter="20">
          <el-col :span="12">
            <div 
              class="method-card" 
              :class="{ active: selectedMethod === 'smart' }"
              @click="selectedMethod = 'smart'"
            >
              <el-icon :size="48"><Camera /></el-icon>
              <h4>智能识别</h4>
              <p>拍照或上传处方单，AI自动识别药品信息</p>
            </div>
          </el-col>
          <el-col :span="12">
            <div 
              class="method-card"
              :class="{ active: selectedMethod === 'manual' }"
              @click="selectedMethod = 'manual'"
            >
              <el-icon :size="48"><Edit /></el-icon>
              <h4>手动添加</h4>
              <p>手动输入药品信息</p>
            </div>
          </el-col>
        </el-row>
      </div>
      <div style="text-align: center; margin-top: 20px">
        <el-button type="primary" size="large" @click="nextStep">
          下一步
        </el-button>
      </div>
    </el-card>

    <el-card v-if="currentStep === 1">
      <template #header>
        <h3>{{ selectedMethod === 'smart' ? '上传处方单' : '填写药品信息' }}</h3>
      </template>
      
      <div v-if="selectedMethod === 'smart'" class="upload-section">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :auto-upload="false"
          :limit="1"
          accept="image/*"
          :on-change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽处方单图片到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 JPG/PNG 格式，文件大小不超过 5MB
            </div>
          </template>
        </el-upload>
        <div v-if="parsing" style="text-align: center; margin-top: 20px">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>正在智能识别中...</p>
        </div>
        <div v-if="parsedData" class="parsed-result">
          <h4>识别结果</h4>
          <el-alert
            v-if="parsedData.warnings?.length"
            :title="'注意事项：' + parsedData.warnings.join(', ')"
            type="warning"
            :closable="false"
          />
          <el-form label-width="100px">
            <el-form-item label="药品名称">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="规格">
              <el-input v-model="formData.specification" />
            </el-form-item>
            <el-form-item label="单次剂量">
              <el-input v-model="formData.dosage" />
            </el-form-item>
            <el-form-item label="服药频率">
              <el-input v-model="formData.frequency" />
            </el-form-item>
            <el-form-item label="服药时间">
              <el-input v-model="formData.timing" />
            </el-form-item>
            <el-form-item label="用药周期">
              <el-input v-model="formData.duration" />
            </el-form-item>
            <el-form-item label="注意事项">
              <el-input v-model="formData.notes" type="textarea" />
            </el-form-item>
          </el-form>
        </div>
        <div v-if="parsedData" style="text-align: center; margin-top: 20px">
          <el-button size="large" @click="currentStep = 0">上一步</el-button>
          <el-button type="primary" size="large" @click="nextStep">下一步</el-button>
        </div>
        <div v-else style="text-align: center; margin-top: 20px">
          <el-button type="primary" size="large" :loading="parsing" @click="parsePrescription">
            开始识别
          </el-button>
        </div>
      </div>

      <el-form v-else ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="药品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入药品名称" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="formData.specification" placeholder="如：10mg/片" />
        </el-form-item>
        <el-form-item label="单次剂量">
          <el-input v-model="formData.dosage" placeholder="如：1片" />
        </el-form-item>
        <el-form-item label="服药频率">
          <el-select v-model="formData.frequency" placeholder="请选择频率">
            <el-option label="每日1次" value="每日1次" />
            <el-option label="每日2次" value="每日2次" />
            <el-option label="每日3次" value="每日3次" />
            <el-option label="每日4次" value="每日4次" />
            <el-option label="每周1次" value="每周1次" />
            <el-option label="按需服用" value="按需服用" />
          </el-select>
        </el-form-item>
        <el-form-item label="服药时间">
          <el-input v-model="formData.timing" placeholder="如：饭后" />
        </el-form-item>
        <el-form-item label="用药周期">
          <el-input v-model="formData.duration" placeholder="如：7天" />
        </el-form-item>
        <el-form-item label="服用人">
          <el-select v-model="formData.familyMemberId" placeholder="请选择服用人">
            <el-option label="自己" :value="null" />
            <el-option
              v-for="member in familyMembers"
              :key="member._id"
              :label="member.name"
              :value="member._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="注意事项">
          <el-input v-model="formData.notes" type="textarea" placeholder="请输入注意事项" />
        </el-form-item>
        <el-form-item>
          <el-button size="large" @click="currentStep = 0">上一步</el-button>
          <el-button type="primary" size="large" @click="nextStep">下一步</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="currentStep === 2">
      <template #header>
        <h3>设置用药计划</h3>
      </template>
      <el-form ref="scheduleFormRef" :model="scheduleData" label-width="100px">
        <el-form-item label="计划类型" prop="scheduleType">
          <el-radio-group v-model="scheduleData.scheduleType">
            <el-radio label="daily">每天</el-radio>
            <el-radio label="weekly">每周</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="scheduleData.scheduleType === 'weekly'" label="选择星期">
          <el-checkbox-group v-model="scheduleData.weekdays">
            <el-checkbox :label="0">周日</el-checkbox>
            <el-checkbox :label="1">周一</el-checkbox>
            <el-checkbox :label="2">周二</el-checkbox>
            <el-checkbox :label="3">周三</el-checkbox>
            <el-checkbox :label="4">周四</el-checkbox>
            <el-checkbox :label="5">周五</el-checkbox>
            <el-checkbox :label="6">周六</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="提醒时间" prop="times">
          <el-time-picker
            v-model="selectedTime"
            placeholder="选择时间"
            format="HH:mm"
            @change="addTime"
          />
          <div class="time-tags" style="margin-top: 10px">
            <el-tag
              v-for="(time, index) in scheduleData.times"
              :key="index"
              closable
              @close="removeTime(index)"
              style="margin-right: 10px"
            >
              {{ time }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="scheduleData.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="scheduleData.endDate"
            type="date"
            placeholder="选择结束日期（选填）"
            format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button size="large" @click="currentStep = 1">上一步</el-button>
          <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            完成
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Camera, Edit, UploadFilled, Loading } from '@element-plus/icons-vue'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const currentStep = ref(0)
const selectedMethod = ref('smart')
const parsing = ref(false)
const parsedData = ref(null)
const submitting = ref(false)
const uploadRef = ref(null)
const formRef = ref(null)
const scheduleFormRef = ref(null)
const familyMembers = ref([])
const selectedTime = ref(null)
const editingId = ref(null)

const formData = ref({
  name: '',
  specification: '',
  dosage: '',
  frequency: '',
  timing: '',
  duration: '',
  notes: '',
  familyMemberId: null,
  source: 'manual'
})

const scheduleData = ref({
  scheduleType: 'daily',
  weekdays: [1, 2, 3, 4, 5],
  times: [],
  startDate: new Date(),
  endDate: null
})

const rules = {
  name: [{ required: true, message: '请输入药品名称', trigger: 'blur' }]
}

const handleFileChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    uploadRef.value.clearFiles()
    return
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB')
    uploadRef.value.clearFiles()
    return
  }
}

const parsePrescription = async () => {
  if (!uploadRef.value.uploadFiles.length) {
    ElMessage.warning('请先上传处方单图片')
    return
  }

  parsing.value = true
  try {
    const formData = new FormData()
    formData.append('image', uploadRef.value.uploadFiles[0].raw)

    const response = await api.post('/medications/parse', formData)
    parsedData.value = response.data
    
    if (response.data.medications?.length > 0) {
      const med = response.data.medications[0]
      formData.value = {
        ...formData.value,
        name: med.name || '',
        specification: med.specification || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        timing: med.timing || '',
        duration: med.duration || '',
        notes: med.notes || '',
        source: 'prescription'
      }
    }

    ElMessage.success('处方单识别成功')
  } catch (error) {
    ElMessage.error('处方单识别失败，请重试')
  } finally {
    parsing.value = false
  }
}

const addTime = () => {
  if (selectedTime.value) {
    const timeStr = selectedTime.value.toTimeString().slice(0, 5)
    if (!scheduleData.value.times.includes(timeStr)) {
      scheduleData.value.times.push(timeStr)
      scheduleData.value.times.sort()
    }
    selectedTime.value = null
  }
}

const removeTime = (index) => {
  scheduleData.value.times.splice(index, 1)
}

const nextStep = () => {
  if (currentStep.value === 0) {
    if (!selectedMethod.value) {
      ElMessage.warning('请选择添加方式')
      return
    }
    if (selectedMethod.value === 'manual') {
      fetchFamilyMembers()
    }
    currentStep.value = 1
  } else if (currentStep.value === 1) {
    if (!formData.value.name) {
      ElMessage.warning('请填写药品名称')
      return
    }
    currentStep.value = 2
  }
}

const fetchFamilyMembers = async () => {
  try {
    const response = await api.get('/family/members')
    familyMembers.value = response.data
  } catch (error) {
    console.error('Failed to fetch family members:', error)
  }
}

const handleSubmit = async () => {
  if (scheduleData.value.times.length === 0) {
    ElMessage.warning('请至少添加一个提醒时间')
    return
  }

  submitting.value = true
  try {
    let medicationId

    if (editingId.value) {
      await api.put(`/medications/${editingId.value}`, formData.value)
      medicationId = editingId.value
    } else {
      const medResponse = await api.post('/medications', formData.value)
      medicationId = medResponse.data._id
    }

    await api.post('/medications/schedules', {
      medicationId,
      familyMemberId: formData.value.familyMemberId,
      scheduleType: scheduleData.value.scheduleType,
      times: scheduleData.value.times,
      weekdays: scheduleData.value.weekdays,
      startDate: scheduleData.value.startDate,
      endDate: scheduleData.value.endDate
    })

    ElMessage.success('药品和用药计划添加成功')
    router.push('/medications')
  } catch (error) {
    ElMessage.error(error.response?.data?.error?.message || '添加失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const { id } = route.query
  if (id) {
    editingId.value = id
    selectedMethod.value = 'manual'
    try {
      const response = await api.get(`/medications/${id}`)
      formData.value = { ...response.data }
      currentStep.value = 1
    } catch (error) {
      ElMessage.error('获取药品信息失败')
    }
  }
  await fetchFamilyMembers()
})
</script>

<style scoped>
.add-medication-container {
  max-width: 800px;
  margin: 0 auto;
}

.method-selection {
  padding: 20px 0;
}

.method-card {
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.method-card:hover {
  border-color: #409EFF;
}

.method-card.active {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.method-card h4 {
  margin: 15px 0 10px;
}

.method-card p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.upload-section {
  padding: 20px 0;
}

.parsed-result {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.parsed-result h4 {
  margin-bottom: 15px;
}

.time-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
