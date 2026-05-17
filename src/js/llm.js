const DEFAULT_SYSTEM_PROMPT = `你是一个专业的药品信息提取助手。请从用户提供的药品描述或图片中提取以下信息，并以JSON格式返回：
{
  "name": "药品名称",
  "dosage": "剂量（如：100mg、1片、5ml）",
  "frequency": "服用频率（daily/twice_daily/three_times/weekly/as_needed）",
  "times": ["服用时间数组，如 08:00", "12:00", "20:00"],
  "method": "服用方式（如：饭后服用、饭前服用、空腹服用、口服等）",
  "notes": "其他注意事项"
}

注意：
- 如果信息不完整，请尽量根据常识推断合理的值
- 时间使用24小时制 HH:MM 格式
- frequency 必须是以下值之一：daily, twice_daily, three_times, weekly, as_needed
- 如果无法识别任何信息，请在对应字段返回空字符串或空数组
- 只返回JSON，不要包含其他文字`

const LLMService = {
    configured: false,
    model: '',

    async init() {
        try {
            const response = await fetch('/api/llm/config');
            const config = await response.json();
            this.configured = config.configured;
            this.model = config.model;
        } catch (error) {
            console.error('LLMService init error:', error);
            this.configured = false;
        }
    },

    isConfigured() {
        return this.configured;
    },

    async callAPI(messages) {
        try {
            const response = await fetch('/api/llm/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return { error: errorData.error || `请求失败: ${response.status}` };
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                return { error: '解析结果异常，请重试' };
            }

            try {
                return JSON.parse(content);
            } catch {
                return { error: '解析结果异常，请重试' };
            }
        } catch (error) {
            console.error('LLMService callAPI error:', error);
            return { error: '无法连接到服务端，请确认 npm start 已启动' };
        }
    },

    async parseText(text) {
        const messages = [
            { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
            { role: 'user', content: text }
        ];

        const result = await this.callAPI(messages);
        if (result.error) {
            return result;
        }

        return {
            name: result.name || '',
            dosage: result.dosage || '',
            frequency: result.frequency || '',
            times: Array.isArray(result.times) ? result.times : [],
            method: result.method || '',
            notes: result.notes || ''
        };
    },

    async parseImage(base64DataUrl) {
        const messages = [
            { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
            {
                role: 'user',
                content: [
                    { type: 'text', text: '请从这张图片中提取药品信息。' },
                    { type: 'image_url', image_url: { url: base64DataUrl } }
                ]
            }
        ];

        const result = await this.callAPI(messages);
        if (result.error) {
            return result;
        }

        return {
            name: result.name || '',
            dosage: result.dosage || '',
            frequency: result.frequency || '',
            times: Array.isArray(result.times) ? result.times : [],
            method: result.method || '',
            notes: result.notes || ''
        };
    },

    async testConnection() {
        try {
            const response = await fetch('/api/llm/test', { method: 'POST' });
            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, error: '连接测试失败: ' + error.message };
        }
    }
};

export { LLMService };