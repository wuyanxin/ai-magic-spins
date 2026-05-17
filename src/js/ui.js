import { AppState } from './state.js';
import { MedicationParser } from './parser.js';
import { NotificationManager } from './notification.js';
import { LLMService } from './llm.js';
import { createMedication, createLog } from './models.js';

const UI = {
    elements: {},

    init() {
        this.elements = {
            currentDate: document.getElementById('currentDate'),
            homeView: document.getElementById('homeView'),
            recordsView: document.getElementById('recordsView'),
            settingsView: document.getElementById('settingsView'),
            todayReminders: document.getElementById('todayReminders'),
            medicationList: document.getElementById('medicationList'),
            historyList: document.getElementById('historyList'),
            medicationModal: document.getElementById('medicationModal'),
            medicationForm: document.getElementById('medicationForm'),
            medicationId: document.getElementById('medicationId'),
            modalTitle: document.getElementById('modalTitle'),
            toast: document.getElementById('toast'),
            notificationToggle: document.getElementById('notificationToggle'),
            totalMedications: document.getElementById('totalMedications'),
            todayCompleted: document.getElementById('todayCompleted'),
            todayPending: document.getElementById('todayPending'),
            weekCompliance: document.getElementById('weekCompliance'),
            monthLogs: document.getElementById('monthLogs'),
            totalLogs: document.getElementById('totalLogs'),
            timePicker: document.getElementById('timePicker'),
            addTimeBtn: document.getElementById('addTimeBtn'),
            daysPicker: document.getElementById('daysPicker'),
            confirmModal: document.getElementById('confirmModal'),
            confirmTitle: document.getElementById('confirmTitle'),
            confirmMessage: document.getElementById('confirmMessage'),
            confirmOk: document.getElementById('confirmOk'),
            medicationName: document.getElementById('medicationName'),
            medicationDosage: document.getElementById('medicationDosage'),
            medicationFrequency: document.getElementById('medicationFrequency'),
            medicationMethod: document.getElementById('medicationMethod'),
            medicationNotes: document.getElementById('medicationNotes'),
            medicationDescription: document.getElementById('medicationDescription'),
            parseResult: document.getElementById('parseResult'),
            parseResultContent: document.getElementById('parseResultContent'),
            applyParseBtn: document.getElementById('applyParseBtn'),
            closeModal: document.getElementById('closeModal'),
            cancelBtn: document.getElementById('cancelBtn'),
            closeConfirmModal: document.getElementById('closeConfirmModal'),
            confirmCancel: document.getElementById('confirmCancel'),
            notificationStatusContainer: document.getElementById('notificationStatusContainer'),
            notificationStatus: document.getElementById('notificationStatus'),
            notificationStatusIcon: document.getElementById('notificationStatusIcon'),
            notificationStatusText: document.getElementById('notificationStatusText')
        };
    },

    updateDate() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        this.elements.currentDate.textContent = now.toLocaleDateString('zh-CN', options);
    },

    refreshAll() {
        this.updateDate();
        this.renderTodayReminders();
        this.renderMedications();
        this.renderHistory();
        this.renderStatistics();
    },

    renderTodayReminders() {
        const reminders = AppState.getTodayReminders();

        if (reminders.length === 0) {
            this.elements.todayReminders.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">📭</div>
                            <div class="empty-title">今日暂无提醒</div>
                            <div class="empty-text">添加药品后，这里会显示您的用药提醒</div>
                        </div>
                    `;
            return;
        }

        this.elements.todayReminders.innerHTML = reminders.map(reminder => `
                    <div class="card reminder-card ${reminder.status === 'taken' ? 'completed' : ''} ${reminder.status === 'skipped' ? 'skipped' : ''}">
                        <div class="card-header">
                            <div>
                                <div class="reminder-time">${reminder.scheduledTime}</div>
                                <div class="card-title">${reminder.medicationName}</div>
                                ${reminder.dosage ? `<div class="card-subtitle">${reminder.dosage}</div>` : ''}
                            </div>
                            <span class="reminder-status status-${reminder.status}">
                                ${reminder.status === 'pending' ? '⏳ 待服用' : ''}
                                ${reminder.status === 'taken' ? '✅ 已服用' : ''}
                                ${reminder.status === 'skipped' ? '⏭️ 已跳过' : ''}
                            </span>
                        </div>
                        <div class="card-content">
                            <span class="method-badge">${reminder.method}</span>
                        </div>
                        ${reminder.status === 'pending' ? `
                            <div class="action-buttons">
                                <button class="btn btn-success btn-sm" onclick="App.markAsTaken('${reminder.id}', '${reminder.medicationId}', '${reminder.scheduledTime}', '${reminder.medicationName}', '${reminder.dosage || ''}')">
                                    ✅ 已服用
                                </button>
                                <button class="btn btn-secondary btn-sm" onclick="App.markAsSkipped('${reminder.id}', '${reminder.medicationId}', '${reminder.scheduledTime}', '${reminder.medicationName}', '${reminder.dosage || ''}')">
                                    ⏭️ 跳过
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
    },

    renderMedications() {
        const medications = AppState.medications;

        if (medications.length === 0) {
            this.elements.medicationList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">💊</div>
                            <div class="empty-title">暂无药品</div>
                            <div class="empty-text">点击下方 "+" 按钮添加您的第一个药品</div>
                        </div>
                    `;
            return;
        }

        this.elements.medicationList.innerHTML = medications.map(med => `
                    <div class="card medication-card" data-id="${med.id}">
                        <div class="card-header">
                            <div>
                                <div class="card-title">${med.name}</div>
                                ${med.dosage ? `<div class="card-subtitle">${med.dosage}</div>` : ''}
                            </div>
                            <div>
                                <span class="time-badge">${this.formatFrequency(med.frequency)}</span>
                                <span class="method-badge">${med.method}</span>
                            </div>
                        </div>
                        <div class="medication-info">
                            <div class="info-item">
                                <span class="info-label">服用时间</span>
                                <span class="info-value">${med.times.join(', ')}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">服用日期</span>
                                <span class="info-value">${this.formatDays(med.days)}</span>
                            </div>
                        </div>
                        ${med.notes ? `<div class="card-content">📝 ${med.notes}</div>` : ''}
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-sm" onclick="App.editMedication('${med.id}')">
                                ✏️ 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="App.deleteMedication('${med.id}')">
                                🗑️ 删除
                            </button>
                        </div>
                    </div>
                `).join('');
    },

    renderHistory() {
        const history = AppState.getHistoryByDate();

        if (history.length === 0) {
            this.elements.historyList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">📋</div>
                            <div class="empty-title">暂无记录</div>
                            <div class="empty-text">您的服药记录将显示在这里</div>
                        </div>
                    `;
            return;
        }

        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        this.elements.historyList.innerHTML = history.map(day => {
            const date = new Date(day.date);
            const dayName = dayNames[date.getDay()];
            const dateStr = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });

            return `
                        <div class="history-date">${dayName} ${dateStr}</div>
                        ${day.logs.map(log => `
                            <div class="log-item">
                                <div class="log-icon ${log.status}">
                                    ${log.status === 'taken' ? '✅' : ''}
                                    ${log.status === 'skipped' ? '⏭️' : ''}
                                    ${log.status === 'pending' ? '⏳' : ''}
                                </div>
                                <div class="log-details">
                                    <div class="log-medication">${log.medicationName}</div>
                                    <div class="log-time">计划 ${log.scheduledTime} · 
                                        ${log.status === 'taken' ? `实际 ${log.actualTime || '未知'}` : ''}
                                        ${log.status === 'skipped' ? '已跳过' : ''}
                                        ${log.status === 'pending' ? '未服用' : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    `;
        }).join('');
    },

    renderStatistics() {
        const stats = AppState.getStatistics();

        this.elements.totalMedications.textContent = stats.totalMedications;
        this.elements.todayCompleted.textContent = stats.todayCompleted;
        this.elements.todayPending.textContent = stats.todayPending;
        this.elements.weekCompliance.textContent = stats.weekCompliance + '%';
        this.elements.monthLogs.textContent = stats.monthLogs;
        this.elements.totalLogs.textContent = stats.totalLogs;

        if (AppState.settings.notificationsEnabled) {
            this.elements.notificationToggle.classList.add('active');
        } else {
            this.elements.notificationToggle.classList.remove('active');
        }

        this.renderNotificationStatus();
    },

    renderNotificationStatus() {
        const statusContainer = this.elements.notificationStatusContainer;
        const statusEl = this.elements.notificationStatus;
        const statusIcon = this.elements.notificationStatusIcon;
        const statusText = this.elements.notificationStatusText;

        if (!NotificationManager.isSupported()) {
            statusContainer.style.display = 'block';
            statusEl.className = 'notification-status unsupported';
            statusIcon.textContent = '⚠️';
            statusText.textContent = '当前浏览器不支持通知功能';
        } else if (Notification.permission === 'granted') {
            statusContainer.style.display = 'block';
            statusEl.className = 'notification-status granted';
            statusIcon.textContent = '✅';
            statusText.textContent = '通知权限已授权，提醒功能已就绪';
        } else if (Notification.permission === 'denied') {
            statusContainer.style.display = 'block';
            statusEl.className = 'notification-status denied';
            statusIcon.textContent = '❌';
            statusText.textContent = '通知权限被拒绝，请在浏览器设置中开启';
        } else {
            statusContainer.style.display = 'block';
            statusEl.className = 'notification-status pending';
            statusIcon.textContent = '⏳';
            statusText.textContent = '点击上方开关以开启通知提醒';
        }
    },

    openModal(title = '添加药品', medicationId = null) {
        this.elements.modalTitle.textContent = title;
        this.elements.medicationForm.reset();
        this.elements.medicationId.value = medicationId || '';

        AppState.selectedTimes = ['08:00', '12:00', '18:00'];
        AppState.selectedDays = [1, 2, 3, 4, 5];
        this.renderTimePicker();
        this.renderDaysPicker();

        if (medicationId) {
            const med = AppState.medications.find(m => m.id === medicationId);
            if (med) {
                this.elements.medicationName.value = med.name;
                this.elements.medicationDosage.value = med.dosage;
                this.elements.medicationFrequency.value = med.frequency;
                this.elements.medicationMethod.value = med.method;
                this.elements.medicationNotes.value = med.notes;

                AppState.selectedTimes = [...med.times];
                AppState.selectedDays = [...med.days];
                this.renderTimePicker();
                this.renderDaysPicker();
            }
        }

        this.elements.medicationModal.classList.add('active');
    },

    closeModal() {
        this.elements.medicationModal.classList.remove('active');
    },

    renderTimePicker() {
        this.elements.timePicker.innerHTML = AppState.selectedTimes.map(time => `
                    <div class="time-chip selected" data-time="${time}">
                        ${time}
                        <button type="button" class="remove-time" onclick="UI.removeTime('${time}')">×</button>
                    </div>
                `).join('');
    },

    removeTime(time) {
        AppState.selectedTimes = AppState.selectedTimes.filter(t => t !== time);
        this.renderTimePicker();
    },

    addTime() {
        const time = prompt('请输入时间 (格式: HH:MM)', '20:00');
        if (time && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            if (!AppState.selectedTimes.includes(time)) {
                AppState.selectedTimes.push(time);
                AppState.selectedTimes.sort();
                this.renderTimePicker();
            }
        } else if (time) {
            this.showToast('请输入正确的时间格式');
        }
    },

    renderDaysPicker() {
        const items = this.elements.daysPicker.querySelectorAll('.checkbox-item');
        items.forEach(item => {
            const day = parseInt(item.dataset.day);
            if (AppState.selectedDays.includes(day)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    },

    showConfirm(title, message, onConfirm) {
        this.elements.confirmTitle.textContent = title;
        this.elements.confirmMessage.textContent = message;
        this.elements.confirmModal.classList.add('active');

        this.elements.confirmOk.onclick = () => {
            onConfirm();
            this.elements.confirmModal.classList.remove('active');
        };
    },

    closeConfirmModal() {
        this.elements.confirmModal.classList.remove('active');
    },

    showToast(message, duration = 2000) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.add('show');

        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, duration);
    },

    formatDays(days) {
        if (days.length === 7) return '每天';
        if (days.length === 5 && !days.includes(0) && !days.includes(6)) return '工作日';
        if (days.length === 2 && days.includes(0) && days.includes(6)) return '周末';

        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days.map(d => dayNames[d]).join(', ');
    },

    formatFrequency(frequency) {
        const map = {
            'daily': '每天',
            'twice_daily': '每天两次',
            'three_times': '每天三次',
            'weekly': '每周',
            'as_needed': '按需'
        };
        return map[frequency] || frequency;
    },

    showLLMLoading() {
        const parseBtn = document.getElementById('parseDescriptionBtn');
        if (parseBtn) {
            parseBtn.disabled = true;
            parseBtn.innerHTML = '<span class="loading"></span> 解析中...';
        }
    },

    hideLLMLoading() {
        const parseBtn = document.getElementById('parseDescriptionBtn');
        if (parseBtn) {
            parseBtn.disabled = false;
            parseBtn.innerHTML = '🤖 智能解析';
        }
    },

    displayLLMResult(result) {
        const parseResultEl = this.elements.parseResult;
        const parseResultContent = this.elements.parseResultContent;

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
                        <span class="parse-result-value ${result.times && result.times.length > 0 ? 'highlight' : ''}">${result.times && result.times.length > 0 ? result.times.join(', ') : '未识别'}</span>
                    </div>
                    <div class="parse-result-item">
                        <span class="parse-result-label">服用方式</span>
                        <span class="parse-result-value ${result.method ? 'highlight' : ''}">${result.method || '未识别'}</span>
                    </div>
                `;

        parseResultEl.style.display = 'block';
    },

    applyLLMResult(result) {
        if (result.name) {
            this.elements.medicationName.value = result.name;
        }
        if (result.dosage) {
            this.elements.medicationDosage.value = result.dosage;
        }
        if (result.frequency) {
            this.elements.medicationFrequency.value = result.frequency;
        }
        if (result.method) {
            this.elements.medicationMethod.value = result.method;
        }
        if (result.times && result.times.length > 0) {
            AppState.selectedTimes = result.times;
            this.renderTimePicker();
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

        this.showToast('已应用解析结果 ✨');
    },

    handleImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;

            const previewContainer = document.getElementById('imagePreview');
            if (previewContainer) {
                previewContainer.innerHTML = `<img src="${base64}" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-top: 8px;">`;
                previewContainer.style.display = 'block';
            }

            this.showLLMLoading();
            try {
                const result = await LLMService.parseImage(base64);
                this.displayLLMResult(result);
            } catch (error) {
                this.showToast('图片解析失败: ' + error.message);
            } finally {
                this.hideLLMLoading();
            }
        };
        reader.readAsDataURL(file);
    }
};

export { UI };