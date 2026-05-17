import Foundation
import Combine

class MedicationViewModel: ObservableObject {
    @Published var medications: [Medication] = []
    @Published var todayMedications: [Medication] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let databaseService = DatabaseService.shared
    private let notificationService = NotificationService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadMedications()
        filterTodayMedications()
    }
    
    func loadMedications(memberId: UUID? = nil) {
        isLoading = true
        medications = databaseService.fetchAllMedications(memberId: memberId).filter { $0.isActive }
        filterTodayMedications()
        isLoading = false
    }
    
    func filterTodayMedications() {
        let today = Date()
        let calendar = Calendar.current
        let weekday = calendar.component(.weekday, from: today)
        
        todayMedications = medications.filter { medication in
            switch medication.frequency {
            case .asNeeded:
                return false
            default:
                return true
            }
        }.sorted { med1, med2 in
            guard let time1 = med1.reminderTimes.first,
                  let time2 = med2.reminderTimes.first else {
                return false
            }
            return time1 < time2
        }
    }
    
    func addMedication(_ medication: Medication, memberId: UUID? = nil) {
        var newMedication = medication
        newMedication.memberId = memberId
        databaseService.addMedication(newMedication)
        
        let today = Date()
        let calendar = Calendar.current
        
        for reminderTime in medication.reminderTimes {
            var components = calendar.dateComponents([.hour, .minute], from: reminderTime)
            components.year = calendar.component(.year, from: today)
            components.month = calendar.component(.month, from: today)
            components.day = calendar.component(.day, from: today)
            
            if let scheduledTime = calendar.date(from: components) {
                let record = DoseRecord(
                    medicationId: medication.id,
                    memberId: memberId,
                    scheduledTime: scheduledTime,
                    status: .pending
                )
                databaseService.addDoseRecord(record)
            }
        }
        
        notificationService.scheduleAllNotifications(for: medication)
        loadMedications(memberId: memberId)
    }
    
    func updateMedication(_ medication: Medication) {
        databaseService.updateMedication(medication)
        notificationService.scheduleAllNotifications(for: medication)
        loadMedications(memberId: medication.memberId)
    }
    
    func deleteMedication(_ medication: Medication) {
        notificationService.cancelNotifications(for: medication)
        databaseService.deleteMedication(id: medication.id)
        loadMedications(memberId: medication.memberId)
    }
    
    func toggleMedicationActive(_ medication: Medication) {
        var updatedMed = medication
        updatedMed.isActive.toggle()
        updatedMed.updatedAt = Date()
        updateMedication(updatedMed)
    }
    
    func getMedicationsByCategory() -> [MedicationCategory: [Medication]] {
        Dictionary(grouping: medications, by: { $0.category })
    }
}
