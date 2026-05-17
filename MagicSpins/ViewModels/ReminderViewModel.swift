import Foundation
import Combine

class ReminderViewModel: ObservableObject {
    @Published var todayDoseRecords: [DoseRecord] = []
    @Published var pendingDoses: [DoseRecord] = []
    @Published var completedDoses: [DoseRecord] = []
    @Published var skippedDoses: [DoseRecord] = []
    
    private let databaseService = DatabaseService.shared
    
    init() {
        loadTodayRecords()
    }
    
    func loadTodayRecords() {
        todayDoseRecords = databaseService.fetchDoseRecords(for: Date())
        
        let today = Date()
        let medications = databaseService.fetchAllMedications().filter { $0.isActive }
        let calendar = Calendar.current
        
        for medication in medications {
            for reminderTime in medication.reminderTimes {
                var components = calendar.dateComponents([.hour, .minute], from: reminderTime)
                components.year = calendar.component(.year, from: today)
                components.month = calendar.component(.month, from: today)
                components.day = calendar.component(.day, from: today)
                
                if let scheduledTime = calendar.date(from: components) {
                    let existingRecord = todayDoseRecords.first { record in
                        record.medicationId == medication.id &&
                        Calendar.current.isDate(record.scheduledTime, equalTo: scheduledTime, toGranularity: .minute)
                    }
                    
                    if existingRecord == nil {
                        let record = DoseRecord(
                            medicationId: medication.id,
                            scheduledTime: scheduledTime,
                            status: .pending
                        )
                        databaseService.addDoseRecord(record)
                    }
                }
            }
        }
        
        todayDoseRecords = databaseService.fetchDoseRecords(for: Date())
        categorizeDoses()
    }
    
    func categorizeDoses() {
        pendingDoses = todayDoseRecords.filter { $0.status == .pending }
        completedDoses = todayDoseRecords.filter { $0.status == .taken }
        skippedDoses = todayDoseRecords.filter { $0.status == .skipped }
    }
    
    func createDoseRecords(for medication: Medication, on date: Date) {
        let calendar = Calendar.current
        
        for reminderTime in medication.reminderTimes {
            var components = calendar.dateComponents([.hour, .minute], from: reminderTime)
            components.year = calendar.component(.year, from: date)
            components.month = calendar.component(.month, from: date)
            components.day = calendar.component(.day, from: date)
            
            if let scheduledTime = calendar.date(from: components) {
                let record = DoseRecord(
                    medicationId: medication.id,
                    scheduledTime: scheduledTime,
                    status: .pending
                )
                databaseService.addDoseRecord(record)
            }
        }
        
        loadTodayRecords()
    }
    
    func markAsTaken(recordId: UUID) {
        if var record = todayDoseRecords.first(where: { $0.id == recordId }) {
            record.status = .taken
            record.actualTime = Date()
            databaseService.updateDoseRecord(record)
            loadTodayRecords()
        }
    }
    
    func markAsSkipped(recordId: UUID, reason: String?) {
        if var record = todayDoseRecords.first(where: { $0.id == recordId }) {
            record.status = .skipped
            record.skippedReason = reason
            databaseService.updateDoseRecord(record)
            loadTodayRecords()
        }
    }
    
    func getRecord(for medicationId: UUID, at time: Date) -> DoseRecord? {
        todayDoseRecords.first { record in
            record.medicationId == medicationId &&
            Calendar.current.isDate(record.scheduledTime, equalTo: time, toGranularity: .minute)
        }
    }
    
    func getCompletionRate() -> Double {
        guard !todayDoseRecords.isEmpty else { return 0 }
        let completed = completedDoses.count + skippedDoses.count
        return Double(completed) / Double(todayDoseRecords.count) * 100
    }
}
