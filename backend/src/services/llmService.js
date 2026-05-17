import axios from 'axios'

class LLMService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    this.model = process.env.OPENAI_MODEL || 'gpt-4'
    this.baseUrl = 'https://api.openai.com/v1'
  }

  async callLLM(prompt, systemPrompt = '') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('LLM API Error:', error.response?.data || error.message)
      throw new Error('LLM服务调用失败')
    }
  }

  async parsePrescription(imageBase64) {
    try {
      const systemPrompt = `你是一个专业的医疗助手。请分析处方单内容并提取药品信息。返回JSON格式，包含medications数组和warnings数组。`

      const prompt = `请分析以下处方单内容，提取药品信息。

处方单内容：
${imageBase64 ? '(已通过OCR提取)' : '无内容'}

请以JSON格式返回：
{
  "medications": [
    {
      "name": "药品名称",
      "specification": "规格（如：10mg/片）",
      "dosage": "单次剂量（如：1片）",
      "frequency": "频率（如：每日3次）",
      "timing": "服药时间（如：饭后）",
      "duration": "用药周期（如：7天）",
      "notes": "注意事项"
    }
  ],
  "doctor_notes": "医生备注",
  "warnings": ["禁忌1", "禁忌2"]
}

请确保返回有效的JSON格式。`

      const response = await this.callLLM(prompt, systemPrompt)
      
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('无法解析处方单内容')
    } catch (error) {
      console.error('Prescription Parse Error:', error)
      throw new Error('处方单解析失败')
    }
  }

  async answerMedicationQuestion(question, userContext = {}) {
    try {
      const systemPrompt = `你是一个专业的医疗助手。请回答用户的用药问题。

注意事项：
1. 回答要专业、准确
2. 涉及医疗决策的建议咨询医生
3. 不要提供具体的用药剂量建议
4. 鼓励用户遵医嘱用药
5. 如果问题涉及严重不良反应，建议立即就医
请用友好的语言回答，并适当使用emoji增加可读性。`

      const prompt = `用户信息：
- 年龄：${userContext.age || '未提供'}
- 健康状况：${userContext.healthConditions || '未提供'}
- 过敏史：${userContext.allergies || '未提供'}

当前用药：${userContext.currentMedications || '未提供'}

用户问题：${question}

请回答用户的问题。`

      const response = await this.callLLM(prompt, systemPrompt)
      return response
    } catch (error) {
      console.error('Medication Question Error:', error)
      throw new Error('用药咨询失败')
    }
  }

  async generateSuggestions(userProfile, medicationHistory = []) {
    try {
      const systemPrompt = `你是一个专业的用药助手。请根据用户的用药历史和习惯，提供个性化建议。`

      const prompt = `用户信息：
${JSON.stringify(userProfile, null, 2)}

用药历史：
${JSON.stringify(medicationHistory, null, 2)}

请提供：
1. 提醒时间优化建议
2. 提高依从性的建议
3. 生活方式调整建议
4. 需要注意的事项

以JSON格式返回：
{
  "reminder_optimization": {
    "suggested_times": ["建议的提醒时间"],
    "reason": "优化理由"
  },
  "adherence_tips": ["提高依从性的建议"],
  "lifestyle_adjustments": ["生活方式调整建议"],
  "important_notes": ["重要注意事项"]
}`

      const response = await this.callLLM(prompt, systemPrompt)
      
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('无法生成建议')
    } catch (error) {
      console.error('Generate Suggestions Error:', error)
      throw new Error('建议生成失败')
    }
  }

  async suggestMissedDose(medication, missedTime, currentTime) {
    try {
      const systemPrompt = `你是一个专业的医疗助手。请提供漏服药品的处理建议。`

      const prompt = `药品信息：
- 名称：${medication.name}
- 规格：${medication.specification || '未提供'}
- 正常剂量：${medication.dosage || '未提供'}
- 服药频率：${medication.frequency || '未提供'}

漏服情况：
- 计划服药时间：${missedTime}
- 当前时间：${currentTime}
- 距离漏服已过时间：${this.calculateTimeDiff(missedTime, currentTime)}

请提供：
1. 是否应该补服
2. 如何补服（如果应该）
3. 注意事项
4. 是否需要咨询医生

以JSON格式返回：
{
  "should_take": true/false,
  "how_to_take": "补服建议",
  "notes": ["注意事项"],
  "consult_doctor": true/false,
  "reason": "判断理由"
}`

      const response = await this.callLLM(prompt, systemPrompt)
      
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('无法生成漏服建议')
    } catch (error) {
      console.error('Missed Dose Suggestion Error:', error)
      throw new Error('漏服建议生成失败')
    }
  }

  calculateTimeDiff(scheduledTime, currentTime) {
    const diff = new Date(currentTime) - new Date(scheduledTime)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }
}

export default new LLMService()
