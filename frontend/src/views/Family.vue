<template>
  <div class="family-container">
    <div class="page-header">
      <h2>家人管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        添加成员
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="member in members" :key="member._id">
        <el-card class="member-card" shadow="hover">
          <template #header>
            <div class="member-header">
              <el-avatar :size="50" :src="member.avatar">
                {{ member.name?.charAt(0) }}
              </el-avatar>
              <div class="member-info">
                <h3>{{ member.name }}</h3>
                <el-tag :type="member.role === 'parent' ? 'success' : 'info'" size="small">
                  {{ member.role === 'parent' ? '家长' : '成员' }}
                </el-tag>
              </div>
            </div>
          </template>
          <div class="member-details">
            <p v-if="member.age"><strong>年龄：</strong>{{ member.age }}岁</p>
            <p v-if="member.phone"><strong>电话：</strong>{{ member.phone }}</p>
            <p v-if="member.gender"><strong>性别：</strong>{{ member.gender === 'male' ? '男' : member.gender === 'female' ? '女' : '其他' }}</p>
            <p v-if="member.allergies?.length"><strong>过敏：</strong>{{ member.allergies.join(', ') }}</p>
            <p v-if="member.healthConditions?.length"><strong>健康状况：</strong>{{ member.healthConditions.join(', ') }}</p>
          </div>
          <div class="member-actions">
            <el-button size="small" type="primary" @click="handleEdit(member)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(member._id)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="members.length === 0" description="暂无家庭成员，点击添加按钮添加">
      <el-button type="primary" @click="showAddDialog = true">添加成员</el-button>
    </el-empty>

    <el-dialog
      v-model="showAddDialog"
      :title="isEditing ? '编辑成员' : '添加成员'"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="家长" value="parent" />
            <el-option label="成员" value="member" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="formData.age" :min="0" :max="150" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择性别">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="过敏史" prop="allergies">
          <el-select
            v-model="formData.allergies"
            multiple
            placeholder="请选择或输入过敏史"
            allow-create
            filterable
          >
            <el-option
              v-for="item in commonAllergies"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="健康状况" prop="healthConditions">
          <el-select
            v-model="formData.healthConditions"
            multiple
            placeholder="请选择或输入健康状况"
            allow-create
            filterable
          >
            <el-option
              v-for="item in commonConditions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEditing ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../services/api'

const members = ref([])
const showAddDialog = ref(false)
const isEditing = ref(false)
const loading = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const formData = ref({
  name: '',
  role: 'member',
  age: null,
  gender: '',
  phone: '',
  allergies: [],
  healthConditions: []
})

const commonAllergies = ['青霉素', '头孢', '磺胺', '阿司匹林', '海鲜', '花粉']
const commonConditions = ['高血压', '糖尿病', '心脏病', '哮喘', '胃病', '肝病', '肾病']

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const fetchMembers = async () => {
  try {
    const response = await api.get('/family/members')
    members.value = response.data
  } catch (error) {
    ElMessage.error('获取家庭成员失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEditing.value) {
          await api.put(`/family/members/${editingId.value}`, formData.value)
          ElMessage.success('成员信息更新成功')
        } else {
          await api.post('/family/members', formData.value)
          ElMessage.success('成员添加成功')
        }
        showAddDialog.value = false
        resetForm()
        fetchMembers()
      } catch (error) {
        ElMessage.error(error.response?.data?.error?.message || '操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleEdit = (member) => {
  isEditing.value = true
  editingId.value = member._id
  formData.value = {
    name: member.name,
    role: member.role,
    age: member.age,
    gender: member.gender || '',
    phone: member.phone || '',
    allergies: member.allergies || [],
    healthConditions: member.healthConditions || []
  }
  showAddDialog.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该成员吗？相关用药记录也会被删除。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete(`/family/members/${id}`)
    ElMessage.success('成员删除成功')
    fetchMembers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    role: 'member',
    age: null,
    gender: '',
    phone: '',
    allergies: [],
    healthConditions: []
  }
  isEditing.value = false
  editingId.value = null
}

onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.family-container {
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

.member-card {
  margin-bottom: 20px;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.member-info h3 {
  margin: 0 0 5px 0;
}

.member-details {
  margin: 15px 0;
}

.member-details p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.member-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
