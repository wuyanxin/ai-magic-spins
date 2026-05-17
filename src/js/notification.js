const NotificationManager = {
    checkInterval: null,
    lastCheckedMinute: -1,

    isSupported() {
        return 'Notification' in window;
    },

    async requestPermission() {
        if (!this.isSupported()) {
            console.warn('当前浏览器不支持通知功能');
            return 'unsupported';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('请求通知权限失败:', error);
            return 'denied';
        }
    },

    showNotification(title, body, icon = '💊') {
        if (!this.isSupported() || Notification.permission !== 'granted') {
            UI.showToast(`${title}: ${body}`);
            return false;
        }

        try {
            const notification = new Notification(title, {
                body: body,
                icon: icon,
                tag: 'medication-reminder',
                requireInteraction: false,
                silent: false
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            setTimeout(() => notification.close(), 10000);
            return true;
        } catch (error) {
            console.error('显示通知失败:', error);
            UI.showToast(`${title}: ${body}`);
            return false;
        }
    },

    startReminderCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.checkReminders();

        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, 60000);
    },

    stopReminderCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    },

    checkReminders() {
        if (!AppState.settings.notificationsEnabled) {
            return;
        }

        const now = new Date();
        const currentMinute = now.getHours() * 60 + now.getMinutes();

        if (currentMinute === this.lastCheckedMinute) {
            return;
        }

        this.lastCheckedMinute = currentMinute;

        const today = new Date();
        const dayOfWeek = today.getDay();
        const todayStr = today.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);

        AppState.medications.forEach(med => {
            if (!med.days.includes(dayOfWeek)) {
                return;
            }

            med.times.forEach(time => {
                if (time !== currentTime) {
                    return;
                }

                const existingLog = AppState.logs.find(
                    l => l.medicationId === med.id &&
                    l.scheduledTime === time &&
                    l.createdAt.startsWith(todayStr)
                );

                if (existingLog && existingLog.status !== 'pending') {
                    return;
                }

                const title = `💊 用药提醒 - ${med.name}`;
                const body = `该服用 ${med.dosage || ''} ${med.method}`.trim();

                this.showNotification(title, body);
            });
        });
    },

    getPermissionStatus() {
        if (!this.isSupported()) {
            return 'unsupported';
        }
        return Notification.permission;
    }
};

export { NotificationManager };