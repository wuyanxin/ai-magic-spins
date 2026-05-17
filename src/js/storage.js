const Storage = {
    KEYS: {
        MEDICATIONS: 'medications',
        LOGS: 'medicationLogs',
        SETTINGS: 'appSettings'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    // Specific data operations
    getMedications() {
        return this.get(this.KEYS.MEDICATIONS) || [];
    },

    saveMedications(medications) {
        return this.set(this.KEYS.MEDICATIONS, medications);
    },

    getLogs() {
        return this.get(this.KEYS.LOGS) || [];
    },

    saveLogs(logs) {
        return this.set(this.KEYS.LOGS, logs);
    },

    getSettings() {
        return this.get(this.KEYS.SETTINGS) || {
            notificationsEnabled: true
        };
    },

    saveSettings(settings) {
        return this.set(this.KEYS.SETTINGS, settings);
    }
};

export { Storage };