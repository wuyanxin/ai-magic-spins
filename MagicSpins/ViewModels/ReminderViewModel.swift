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
    
    func loadTodayRecords(memberId: UUID? = nil) {
        todayDoseRecords = databaseService.fetchDoseRecords(for: Date(), memberId: memberId)
        
        let today = Date()
        let medications = databaseService.fetchAllMedications(memberId: memberId).filter { $0.isActive }
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
                            memberId: memberId,
                            scheduledTime: scheduledTime,
                            status: .pending
                        )
                        databaseService.addDoseRecord(record)
                    }
                }
            }
        }
        
        todayDoseRecords = databaseService.fetchDoseRecords(for: Date(), memberId: memberId)
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
                    memberId: medication.memberId,
                    scheduledTime: scheduledTime,
                    status: .pending
                )
                databaseService.addDoseRecord(record)
            }
        }
        
        loadTodayRecords(memberId: medication.memberId)
    }
    
    func markAsTaken(recordId: UUID) {
        var records = databaseService.fetchDoseRecords(for: Date())
        if let index = records.firstIndex(where: { $0.id == recordId }) {
            records[index].status = .taken
            records[index].actualTime = Date()
            databaseService.updateDoseRecord(records[index])
            
            if let memberId = records[index].memberId {
                loadTodayRecords(memberId: memberId)
            } else {
                loadTodayRecords()
            }
        }
    }
    
    func markAsSkipped(recordId: UUID, reason: String?) {
        var records = databaseService.fetchDoseRecords(for: Date())
        if let index = records.firstIndex(where: { $0.id == recordId }) {
            records[index].status = .skipped
            records[index].skippedReason = reason
            databaseService.updateDoseRecord(records[index])
            
            if let memberId = records[index].memberId {
                loadTodayRecords(memberId: memberId)
            } else {
                loadTodayRecords()
            }
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
