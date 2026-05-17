const MedicationParser = {
    parseMedicationDescription(text) {
        if (!text || !text.trim()) {
            return { error: '请输入药品描述' };
        }

        const result = {
            name: '',
            dosage: '',
            frequency: '',
            times: [],
            method: ''
        };

        const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length === 0) {
            return { error: '请输入有效的药品描述' };
        }

        const fullText = text.replace(/\n/g, ' ');

        const namePatterns = [
            /(?:药品名[：:]\s*)(.+?)(?:\s+\d|[\u4e00-\u9fa5]{2,3}[,，]|$)/i,
            /^([^\d\s][^\d,，]+?)(?:\s+\d|[\u4e00-\u9fa5]{2,3}[,，]|$)/,
            /([\u4e00-\u9fa5a-zA-Z]+(?:片|粒|胶囊|丸|ml|mg))/i,
            /(?:名称[：:]\s*)(.+?)(?:\s|$)/i
        ];
        for (const pattern of namePatterns) {
            const match = fullText.match(pattern);
            if (match && match[1]) {
                result.name = match[1].trim().replace(/[，,]$/, '');
                break;
            }
        }
        if (!result.name && lines[0]) {
            const firstLine = lines[0].trim();
            const dosageMatch = firstLine.match(/^([\u4e00-\u9fa5a-zA-Z]+)/);
            if (dosageMatch) {
                result.name = dosageMatch[1];
            }
        }

        const dosagePatterns = [
            /(\d+(?:\.\d+)?\s*(?:mg|ml|ug|g|毫克|毫升|微克|克))/gi,
            /(\d+(?:\.\d+)?\s*(?:片|粒|丸|颗|支|袋|包|单位))/gi,
            /(?:每次|每次服用)\s*(\d+(?:\.\d+)?(?:片|粒|丸|颗|支|袋|包|ml|mg|ug|克|毫升|毫克))/gi,
            /(?:剂量[：:]\s*)(.+?)(?:\s+[\u4e00-\u9fa5]|,|$)/i
        ];
        for (const pattern of dosagePatterns) {
            const match = fullText.match(pattern);
            if (match && match[0]) {
                const dosageText = match[0].replace(/(?:每次|每次服用|剂量[：:]\s*)/gi, '');
                result.dosage = dosageText;
                break;
            }
        }
        if (!result.dosage) {
            const dosageInLine = lines.find(line => /\d+\s*(?:mg|ml|片|粒|丸|颗)/i.test(line));
            if (dosageInLine) {
                const dosageMatch = dosageInLine.match(/(\d+(?:\.\d+)?\s*(?:mg|ml|ug|g|片|粒|丸|颗|支|袋|包|单位|毫升|毫克|微克|克))/i);
                if (dosageMatch) {
                    result.dosage = dosageMatch[1];
                }
            }
        }

        const frequencyPatterns = [
            [/(?:每日|每天)\s*[0-9零一二两三四五六七八九十百]+(?:次|顿)/gi, (match) => {
                const count = match[0].match(/[0-9零一二两三四五六七八九十]+/)[0];
                const cnNum = { '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
                const num = parseInt(count) || cnNum[count] || 0;
                if (num === 1) return 'daily';
                if (num === 2) return 'twice_daily';
                if (num === 3) return 'three_times';
                return 'daily';
            }],
            [/(?:每[0-9]+小时|每[零一二三四五六七八九十]+小时)\s*[0-9]+(?:次|片|粒)/gi, () => 'daily'],
            [/(?:每周|一周)\s*[0-9零一二三四五六七八九十]+(?:次|顿)/gi, () => 'weekly'],
            [/(?:按需|必要时|需要时)/gi, () => 'as_needed'],
            [/(?:每日|每天)/gi, () => 'daily'],
            [/(?:每日[0-9零一二两三四五六七八九十]+次)/gi, (match) => {
                const num = parseInt(match[0].match(/\d+/)[0]) || 0;
                if (num === 1) return 'daily';
                if (num === 2) return 'twice_daily';
                if (num === 3) return 'three_times';
                return 'daily';
            }]
        ];
        for (const [pattern, handler] of frequencyPatterns) {
            const match = fullText.match(pattern);
            if (match) {
                result.frequency = handler(match);
                break;
            }
        }

        const timePatterns = [
            /(\d{1,2}:\d{2})/g,
            /(\d{1,2}[时点]\d{0,2}分?)/g,
            /(\d{1,2}\s*[时点]\s*\d{0,2})/g
        ];
        for (const pattern of timePatterns) {
            const matches = fullText.match(pattern);
            if (matches) {
                for (const time of matches) {
                    const normalizedTime = time.replace(/[时点分\s]/g, '');
                    const timeMatch = normalizedTime.match(/^(\d{1,2}):?(\d{2})$/);
                    if (timeMatch) {
                        const hours = parseInt(timeMatch[1]);
                        const minutes = timeMatch[2] || '00';
                        if (hours >= 0 && hours <= 23) {
                            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
                            if (!result.times.includes(formattedTime)) {
                                result.times.push(formattedTime);
                            }
                        }
                    }
                }
            }
            if (result.times.length > 0) break;
        }
        if (result.times.length === 0) {
            const timeNumbers = fullText.match(/\d{1,2}(?::\d{2})?/g);
            if (timeNumbers) {
                for (const t of timeNumbers) {
                    const timeMatch = t.match(/^(\d{1,2}):(\d{2})$/);
                    if (timeMatch) {
                        const hours = parseInt(timeMatch[1]);
                        if (hours >= 6 && hours <= 22) {
                            const formattedTime = `${hours.toString().padStart(2, '0')}:${timeMatch[2]}`;
                            if (!result.times.includes(formattedTime)) {
                                result.times.push(formattedTime);
                            }
                        }
                    }
                }
            }
        }
        result.times.sort();

        const methodPatterns = [
            /(?:服用方式|用法)[：:]\s*([^\s,，]+)/i,
            /(?:餐后|饭后|餐后|随餐|空腹|饭前|睡前|晨起|外用|含服|吞服|嚼服|注射|口服)/gi
        ];
        for (const pattern of methodPatterns) {
            const match = fullText.match(pattern);
            if (match) {
                const methodText = match[0].replace(/(?:服用方式|用法)[：:]\s*/, '');
                const methodMap = {
                    '饭后': '饭后服用',
                    '餐后': '饭后服用',
                    '饭前': '饭前服用',
                    '空腹': '空腹服用',
                    '随餐': '随餐服用',
                    '睡前': '睡前服用',
                    '晨起': '晨起服用',
                    '口服': '口服',
                    '外用': '外用',
                    '含服': '含服',
                    '吞服': '口服',
                    '嚼服': '口服',
                    '注射': '注射'
                };
                result.method = methodMap[methodText] || methodText;
                break;
            }
        }

        return result;
    },

    displayParseResult(result) {
        const parseResultEl = document.getElementById('parseResult');
        const parseResultContent = document.getElementById('parseResultContent');

        if (result.error) {
            parseResultEl.style.display = 'block';
            parseResultContent.innerHTML = `<div style="color: var(--danger-color); padding: 12px; text-align: center;">${result.error}</div>`;
            return;
        }

        const frequencyMap = {
            'daily': '每天',
            'twice_daily': '每天两次',
            'three_times': '每天三次',
            'weekly': '每周',
            'as_needed': '按需服用'
        };

        parseResultContent.innerHTML = `
            <div class="parse-result-item">
                <span class="parse-result-label">药品名称</span>
                <span class="parse-result-value ${result.name ? 'highlight' : ''}">${result.name || '未识别'}</span>
            </div>
            <div class="parse-result-item">
                <span class="parse-result-label">剂量</span>
                <span class="parse-result-value ${result.dosage ? 'highlight' : ''}">${result.dosage || '未识别'}</span>
            </div>
            <div class="parse-result-item">
                <span class="parse-result-label">服用频率</span>
                <span class="parse-result-value ${result.frequency ? 'highlight' : ''}">${result.frequency ? frequencyMap[result.frequency] || result.frequency : '未识别'}</span>
            </div>
            <div class="parse-result-item">
                <span class="parse-result-label">服用时间</span>
                <span class="parse-result-value ${result.times.length > 0 ? 'highlight' : ''}">${result.times.length > 0 ? result.times.join(', ') : '未识别'}</span>
            </div>
            <div class="parse-result-item">
                <span class="parse-result-label">服用方式</span>
                <span class="parse-result-value ${result.method ? 'highlight' : ''}">${result.method || '未识别'}</span>
            </div>
        `;

        parseResultEl.style.display = 'block';
    },

    applyParsedResult(result) {
        if (result.name) {
            document.getElementById('medicationName').value = result.name;
        }
        if (result.dosage) {
            document.getElementById('medicationDosage').value = result.dosage;
        }
        if (result.frequency) {
            document.getElementById('medicationFrequency').value = result.frequency;
        }
        if (result.method) {
            document.getElementById('medicationMethod').value = result.method;
        }
        if (result.times.length > 0) {
            AppState.selectedTimes = result.times;
            UI.renderTimePicker();
        }

        const tabs = document.querySelectorAll('.form-tab');
        const manualTab = document.querySelector('[data-tab="manual"]');
        const smartTab = document.querySelector('[data-tab="smart"]');
        const manualContent = document.getElementById('manualTab');
        const smartContent = document.getElementById('smartTab');

        tabs.forEach(tab => tab.classList.remove('active'));
        manualTab.classList.add('active');
        manualContent.classList.add('active');
        smartContent.classList.remove('active');

        UI.showToast('已应用解析结果 ✨');
    }
};

export { MedicationParser };