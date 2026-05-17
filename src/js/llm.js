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

const STORAGE_KEY = 'llmConfig';

const LLMService = {
    config: {
        endpoint: '',
        apiKey: '',
        model: 'gpt-4o',
        corsProxy: '',
        systemPrompt: DEFAULT_SYSTEM_PROMPT
    },

    init() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.config = {
                    ...this.config,
                    ...parsed
                };
            }
        } catch (error) {
            console.error('LLMService init error:', error);
        }
    },

    saveConfig(config) {
        try {
            this.config = {
                ...this.config,
                ...config
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('LLMService saveConfig error:', error);
            return false;
        }
    },

    getConfig() {
        return { ...this.config };
    },

    isConfigured() {
        return !!(this.config.endpoint && this.config.apiKey);
    },

    async callAPI(messages) {
        try {
            const endpoint = this.config.corsProxy
                ? this.config.corsProxy.replace(/\/?$/, '') + '/' + this.config.endpoint.replace(/^https?:\/\//, '')
                : this.config.endpoint;
            const url = `${endpoint}/chat/completions`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: messages,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                return { error: `API错误: ${response.status} ${response.statusText}${errorText ? ' - ' + errorText : ''}` };
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
            if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
                return { error: '跨域请求被阻止（CORS错误），请在LLM配置中填写CORS代理地址，例如：https://corsproxy.io/?' };
            }
            return { error: '网络连接失败，请检查API配置' };
        }
    },

    async parseText(text) {
        const messages = [
            { role: 'system', content: this.config.systemPrompt },
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
            { role: 'system', content: this.config.systemPrompt },
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
        const messages = [
            { role: 'system', content: '你是一个助手。' },
            { role: 'user', content: '回复"连接成功"四个字。' }
        ];

        const result = await this.callAPI(messages);
        if (result.error) {
            return { error: result.error };
        }

        return { success: true };
    }
};

export { LLMService };