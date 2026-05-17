import { Storage } from './storage.js';
import { createLog } from './models.js';

const AppState = {
    currentView: 'home',
    medications: [],
    logs: [],
    settings: {},
    selectedTimes: ['08:00', '12:00', '18:00'],
    selectedDays: [1, 2, 3, 4, 5],

    init() {
        this.medications = Storage.getMedications();
        this.logs = Storage.getLogs();
        this.settings = Storage.getSettings();
    },

    addMedication(medication) {
        this.medications.push(medication);
        Storage.saveMedications(this.medications);
        this.generateTodayReminders(medication);
    },

    updateMedication(id, data) {
        const index = this.medications.findIndex(m => m.id === id);
        if (index !== -1) {
            this.medications[index] = {
                ...this.medications[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            Storage.saveMedications(this.medications);
        }
    },

    deleteMedication(id) {
        this.medications = this.medications.filter(m => m.id !== id);
        Storage.saveMedications(this.medications);
    },

    addLog(log) {
        this.logs.unshift(log);
        Storage.saveLogs(this.logs);
    },

    updateLog(id, data) {
        const index = this.logs.findIndex(l => l.id === id);
        if (index !== -1) {
            this.logs[index] = { ...this.logs[index], ...data };
            Storage.saveLogs(this.logs);
        }
    },

    getTodayReminders() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const todayStr = today.toISOString().split('T')[0];
        
        const reminders = [];
        
        this.medications.forEach(med => {
            if (med.days.includes(dayOfWeek)) {
                med.times.forEach(time => {
                    const existingLog = this.logs.find(
                        l => l.medicationId === med.id && 
                        l.scheduledTime === time &&
                        l.createdAt.startsWith(todayStr)
                    );
                    
                    reminders.push({
                        id: existingLog ? existingLog.id : `${med.id}-${time}`,
                        medicationId: med.id,
                        medicationName: med.name,
                        dosage: med.dosage,
                        method: med.method,
                        scheduledTime: time,
                        status: existingLog ? existingLog.status : 'pending',
                        logId: existingLog ? existingLog.id : null
                    });
                });
            }
        });

        return reminders.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    },

    generateTodayReminders(medication) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        if (medication.days.includes(dayOfWeek)) {
            medication.times.forEach(time => {
                const todayStr = today.toISOString().split('T')[0];
                const existingLog = this.logs.find(
                    l => l.medicationId === medication.id && 
                    l.scheduledTime === time &&
                    l.createdAt.startsWith(todayStr)
                );
                
                if (!existingLog) {
                    const log = createLog({
                        medicationId: medication.id,
                        medicationName: medication.name,
                        scheduledTime: time,
                        status: 'pending'
                    });
                    this.addLog(log);
                }
            });
        }
    },

    getHistoryByDate() {
        const grouped = {};
        
        this.logs.forEach(log => {
            const date = log.createdAt.split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(log);
        });

        return Object.entries(grouped)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, logs]) => ({
                date,
                logs: logs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
            }));
    },

    getStatistics() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const todayLogs = this.logs.filter(l => l.createdAt.startsWith(todayStr));
        const weekLogs = this.logs.filter(l => l.createdAt.split('T')[0] >= weekAgo);
        const monthLogs = this.logs.filter(l => l.createdAt.split('T')[0] >= monthAgo);

        const weekCompleted = weekLogs.filter(l => l.status === 'taken').length;
        const weekTotal = weekLogs.length;
        const weekCompliance = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

        return {
            totalMedications: this.medications.length,
            todayCompleted: todayLogs.filter(l => l.status === 'taken').length,
            todayPending: todayLogs.filter(l => l.status === 'pending').length,
            weekCompliance,
            monthLogs: monthLogs.length,
            totalLogs: this.logs.length
        };
    }
};

export { AppState };