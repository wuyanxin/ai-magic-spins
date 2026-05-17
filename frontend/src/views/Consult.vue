<template>
  <div class="consult-container">
    <div class="page-header">
      <h2>用药咨询</h2>
    </div>

    <el-card class="chat-card">
      <template #header>
        <div class="chat-header">
          <h3>AI用药助手</h3>
          <el-tag type="success">AI驱动</el-tag>
        </div>
      </template>
      
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="message-content">
            <div class="message-avatar">
              {{ message.role === 'user' ? '我' : 'AI' }}
            </div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
        </div>
        <div v-if="loading" class="message assistant">
          <div class="message-content">
            <div class="message-avatar">AI</div>
            <div class="message-text">
              <el-icon class="is-loading"><Loading /></el-icon>
              正在思考中...
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-select v-model="selectedMember" placeholder="选择成员（可选）" clearable style="width: 200px; margin-right: 10px">
          <el-option
            v-for="member in familyMembers"
            :key="member._id"
            :label="member.name"
            :value="member._id"
          />
        </el-select>
        <el-input
          v-model="question"
          type="textarea"
          :rows="2"
          placeholder="请输入您的用药问题..."
          @keydown.enter.ctrl="sendQuestion"
        />
        <el-button type="primary" :loading="loading" @click="sendQuestion">
          发送
        </el-button>
      </div>
    </el-card>

    <el-card class="quick-questions">
      <template #header>
        <h3>常见问题</h3>
      </template>
      <el-space wrap>
        <el-button
          v-for="q in quickQuestions"
          :key="q"
          @click="askQuickQuestion(q)"
        >
          {{ q }}
        </el-button>
      </el-space>
    </el-card>

    <el-card class="disclaimer">
      <el-alert
        title="免责声明"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          AI助手提供的回答仅供参考，不能替代专业医疗建议。如有严重不适或紧急情况，请立即就医或咨询医生。
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import api from '../services/api'

const messages = ref([
  {
    role: 'assistant',
    content: '您好！我是您的AI用药助手。我可以帮助您解答用药相关的问题，例如药品使用方法、副作用、相互作用等。请注意，这些回答仅供参考，如有疑问请咨询医生。'
  }
])

const question = ref('')
const loading = ref(false)
const messagesContainer = ref(null)
const selectedMember = ref(null)
const familyMembers = ref([])

const quickQuestions = [
  '这个药有什么副作用？',
  '可以和其他药一起吃吗？',
  '忘了服药怎么办？',
  '服药期间有什么禁忌？',
  '如何提高服药依从性？'
]

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

const sendQuestion = async () => {
  if (!question.value.trim()) {
    ElMessage.warning('请输入问题')
    return
  }

  messages.value.push({
    role: 'user',
    content: question.value
  })

  const userQuestion = question.value
  question.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const response = await api.post('/consult', { question: userQuestion }, {
      params: { familyMemberId: selectedMember.value }
    })

    messages.value.push({
      role: 'assistant',
      content: response.data.answer
    })
  } catch (error) {
    ElMessage.error('咨询失败，请重试')
    messages.value.pop()
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const askQuickQuestion = (q) => {
  question.value = q
  sendQuestion()
}

const fetchFamilyMembers = async () => {
  try {
    const response = await api.get('/family/members')
    familyMembers.value = response.data
  } catch (error) {
    console.error('Failed to fetch family members:', error)
  }
}

onMounted(() => {
  fetchFamilyMembers()
  scrollToBottom()
})
</script>

<style scoped>
.consult-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.chat-card {
  margin-bottom: 20px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 20px 0;
}

.message {
  margin-bottom: 20px;
}

.message.user {
  text-align: right;
}

.message-content {
  display: flex;
  gap: 10px;
  max-width: 80%;
}

.message.user .message-content {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background-color: #409EFF;
  color: white;
}

.message.assistant .message-avatar {
  background-color: #67C23A;
  color: white;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.6;
  text-align: left;
}

.message.user .message-text {
  background-color: #409EFF;
  color: white;
}

.message.assistant .message-text {
  background-color: #f5f7fa;
  color: #303133;
}

.chat-input {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  align-items: flex-end;
}

.quick-questions {
  margin-bottom: 20px;
}

.disclaimer {
  margin-bottom: 20px;
}
</style>
