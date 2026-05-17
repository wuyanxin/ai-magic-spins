import { Storage } from './storage.js';
import { AppState } from './state.js';
import { UI } from './ui.js';
import { NotificationManager } from './notification.js';
import { LLMService } from './llm.js';
import { MedicationParser } from './parser.js';
import { createMedication, createLog } from './models.js';

const App = {
    init() {
        AppState.init();
        LLMService.init();
        UI.init();
        this.bindEvents();
        UI.refreshAll();
    },

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                App.switchView(item.dataset.view);
            });
        });

        document.getElementById('addMedicationBtn').addEventListener('click', () => {
            UI.openModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            UI.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            UI.closeModal();
        });

        document.querySelectorAll('.form-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tabName + 'Tab').classList.add('active');
            });
        });

        document.getElementById('parseDescriptionBtn').addEventListener('click', () => {
            const description = document.getElementById('medicationDescription').value;
            const result = MedicationParser.parseMedicationDescription(description);
            MedicationParser.displayParseResult(result);
        });

        document.getElementById('applyParseBtn').addEventListener('click', () => {
            const description = document.getElementById('medicationDescription').value;
            const result = MedicationParser.parseMedicationDescription(description);
            if (!result.error) {
                MedicationParser.applyParsedResult(result);
            }
        });

        const llmParseBtn = document.getElementById('llmParseBtn');
        if (llmParseBtn) {
            llmParseBtn.addEventListener('click', () => {
                App.handleLLMTextParse();
            });
        }

        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    App.handleLLMImageParse(e.target.files[0]);
                }
            });
        }

        document.getElementById('addTimeBtn').addEventListener('click', () => {
            UI.addTime();
        });

        UI.elements.timePicker.addEventListener('click', (e) => {
            const chip = e.target.closest('.time-chip');
            if (chip && !e.target.classList.contains('remove-time')) {
                chip.classList.toggle('selected');
                const time = chip.dataset.time;
                if (chip.classList.contains('selected')) {
                    if (!AppState.selectedTimes.includes(time)) {
                        AppState.selectedTimes.push(time);
                        AppState.selectedTimes.sort();
                    }
                } else {
                    AppState.selectedTimes = AppState.selectedTimes.filter(t => t !== time);
                }
            }
        });

        UI.elements.daysPicker.addEventListener('click', (e) => {
            const item = e.target.closest('.checkbox-item');
            if (item) {
                item.classList.toggle('selected');
                const day = parseInt(item.dataset.day);
                if (item.classList.contains('selected')) {
                    if (!AppState.selectedDays.includes(day)) {
                        AppState.selectedDays.push(day);
                    }
                } else {
                    AppState.selectedDays = AppState.selectedDays.filter(d => d !== day);
                }
            }
        });

        UI.elements.medicationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            App.saveMedication();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            App.exportData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                App.importData(e.target.files[0]);
            }
        });

        document.getElementById('notificationToggle').addEventListener('click', async () => {
            if (!AppState.settings.notificationsEnabled) {
                const permission = await NotificationManager.requestPermission();
                if (permission === 'granted') {
                    AppState.settings.notificationsEnabled = true;
                    UI.showToast('提醒已开启 🔔');
                } else if (permission === 'denied') {
                    UI.showToast('通知权限被拒绝，请在浏览器设置中开启');
                } else {
                    UI.showToast('当前浏览器不支持通知功能');
                }
            } else {
                AppState.settings.notificationsEnabled = false;
                UI.showToast('提醒已关闭');
            }
            Storage.saveSettings(AppState.settings);
            UI.renderStatistics();
        });

        document.getElementById('clearData').addEventListener('click', () => {
            UI.showConfirm('清除所有数据', '确定要清除所有药品和记录数据吗？此操作不可恢复。', () => {
                Storage.remove(Storage.KEYS.MEDICATIONS);
                Storage.remove(Storage.KEYS.LOGS);
                AppState.medications = [];
                AppState.logs = [];
                UI.refreshAll();
                UI.showToast('数据已清除');
            });
        });

        document.getElementById('closeConfirmModal').addEventListener('click', () => {
            UI.closeConfirmModal();
        });

        document.getElementById('confirmCancel').addEventListener('click', () => {
            UI.closeConfirmModal();
        });

        UI.elements.medicationModal.addEventListener('click', (e) => {
            if (e.target === UI.elements.medicationModal) {
                UI.closeModal();
            }
        });

        UI.elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === UI.elements.confirmModal) {
                UI.closeConfirmModal();
            }
        });

        App.generateTodayReminders();

        if (NotificationManager.isSupported() && Notification.permission === 'granted') {
            NotificationManager.startReminderCheck();
        }
    },

    saveMedication() {
        const id = document.getElementById('medicationId').value;
        const name = document.getElementById('medicationName').value.trim();
        const dosage = document.getElementById('medicationDosage').value.trim();
        const frequency = document.getElementById('medicationFrequency').value;
        const method = document.getElementById('medicationMethod').value;
        const notes = document.getElementById('medicationNotes').value.trim();

        if (!name) {
            UI.showToast('请输入药品名称');
            return;
        }

        if (AppState.selectedTimes.length === 0) {
            UI.showToast('请至少选择一个服用时间');
            return;
        }

        if (AppState.selectedDays.length === 0) {
            UI.showToast('请至少选择一个服用日期');
            return;
        }

        const medicationData = {
            name,
            dosage,
            frequency,
            method,
            times: AppState.selectedTimes,
            days: AppState.selectedDays,
            notes
        };

        if (id) {
            AppState.updateMedication(id, medicationData);
            UI.showToast('药品已更新');
        } else {
            const medication = createMedication(medicationData);
            AppState.addMedication(medication);
            UI.showToast('药品已添加');
        }

        UI.closeModal();
        UI.refreshAll();
    },

    editMedication(id) {
        UI.openModal('编辑药品', id);
    },

    deleteMedication(id) {
        const medication = AppState.medications.find(m => m.id === id);
        if (!medication) return;

        UI.showConfirm('删除药品', `确定要删除 "${medication.name}" 吗？`, () => {
            AppState.deleteMedication(id);
            UI.refreshAll();
            UI.showToast('药品已删除');
        });
    },

    markAsTaken(reminderId, medicationId, scheduledTime, medicationName, dosage) {
        const todayStr = new Date().toISOString().split('T')[0];
        const actualTime = new Date().toTimeString().slice(0, 5);

        let log = AppState.logs.find(
            l => l.id === reminderId ||
            (l.medicationId === medicationId &&
             l.scheduledTime === scheduledTime &&
             l.createdAt.startsWith(todayStr))
        );

        if (log) {
            AppState.updateLog(log.id, {
                status: 'taken',
                actualTime
            });
        } else {
            log = createLog({
                medicationId,
                medicationName,
                scheduledTime,
                actualTime,
                status: 'taken',
                dosage
            });
            AppState.addLog(log);
        }

        UI.refreshAll();
        UI.showToast('已标记为已服用 ✅');
    },

    markAsSkipped(reminderId, medicationId, scheduledTime, medicationName, dosage) {
        const todayStr = new Date().toISOString().split('T')[0];

        let log = AppState.logs.find(
            l => l.id === reminderId ||
            (l.medicationId === medicationId &&
             l.scheduledTime === scheduledTime &&
             l.createdAt.startsWith(todayStr))
        );

        if (log) {
            AppState.updateLog(log.id, {
                status: 'skipped'
            });
        } else {
            log = createLog({
                medicationId,
                medicationName,
                scheduledTime,
                status: 'skipped',
                dosage
            });
            AppState.addLog(log);
        }

        UI.refreshAll();
        UI.showToast('已跳过 ⏭️');
    },

    switchView(viewName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === viewName + 'View');
        });

        AppState.currentView = viewName;

        if (viewName === 'records') {
            UI.renderHistory();
        } else if (viewName === 'settings') {
            UI.renderStatistics();
        }
    },

    exportData() {
        const data = {
            medications: AppState.medications,
            logs: AppState.logs,
            settings: AppState.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medication-reminder-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UI.showToast('数据导出成功 📤');
    },

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.medications && data.logs) {
                    AppState.medications = data.medications;
                    AppState.logs = data.logs;

                    if (data.settings) {
                        AppState.settings = data.settings;
                    }

                    Storage.saveMedications(AppState.medications);
                    Storage.saveLogs(AppState.logs);
                    Storage.saveSettings(AppState.settings);

                    UI.refreshAll();
                    UI.showToast('数据导入成功 📥');
                } else {
                    UI.showToast('文件格式不正确');
                }
            } catch (error) {
                UI.showToast('导入失败，请检查文件格式');
            }
        };
        reader.readAsText(file);
        document.getElementById('fileInput').value = '';
    },

    generateTodayReminders() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const todayStr = today.toISOString().split('T')[0];

        AppState.medications.forEach(med => {
            if (med.days.includes(dayOfWeek)) {
                med.times.forEach(time => {
                    const existingLog = AppState.logs.find(
                        l => l.medicationId === med.id &&
                        l.scheduledTime === time &&
                        l.createdAt.startsWith(todayStr)
                    );

                    if (!existingLog) {
                        const log = createLog({
                            medicationId: med.id,
                            medicationName: med.name,
                            scheduledTime: time,
                            status: 'pending'
                        });
                        AppState.addLog(log);
                    }
                });
            }
        });
    },

    async handleLLMTextParse() {
        const text = document.getElementById('llmDescription').value.trim();
        if (!text) {
            UI.showToast('请输入药品描述');
            return;
        }

        if (!LLMService.isConfigured()) {
            UI.showToast('请先在 .env 文件中配置 LLM_API_KEY');
            return;
        }

        UI.showLLMLoading();
        try {
            const result = await LLMService.parseText(text);
            UI.displayLLMResult(result);
        } catch (error) {
            UI.showToast('解析失败: ' + error.message);
        } finally {
            UI.hideLLMLoading();
        }
    },

    handleLLMImageParse(file) {
        if (!file) return;
        UI.handleImageUpload(file);
    },
};

document.addEventListener('DOMContentLoaded', () => {
    window.App = App;
    App.init();
});