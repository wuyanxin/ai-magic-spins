function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createMedication(data) {
    return {
        id: data.id || generateId(),
        name: data.name,
        dosage: data.dosage || '',
        frequency: data.frequency || 'daily',
        times: data.times || ['08:00'],
        method: data.method || '口服',
        days: data.days || [1, 2, 3, 4, 5],
        notes: data.notes || '',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

function createLog(data) {
    return {
        id: data.id || generateId(),
        medicationId: data.medicationId,
        medicationName: data.medicationName,
        scheduledTime: data.scheduledTime,
        actualTime: data.actualTime || null,
        status: data.status || 'pending',
        notes: data.notes || '',
        createdAt: data.createdAt || new Date().toISOString()
    };
}

export { generateId, createMedication, createLog };