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
    
    func loadMedications() {
        isLoading = true
        do {
            medications = try databaseService.fetchAllMedications().filter { $0.isActive }
            filterTodayMedications()
            isLoading = false
        } catch {
            errorMessage = "加载药物失败: \(error.localizedDescription)"
            isLoading = false
        }
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
    
    func addMedication(_ medication: Medication) {
        do {
            try databaseService.addMedication(medication)
            notificationService.scheduleAllNotifications(for: medication)
            loadMedications()
        } catch {
            errorMessage = "添加药物失败: \(error.localizedDescription)"
        }
    }
    
    func updateMedication(_ medication: Medication) {
        do {
            try databaseService.updateMedication(medication)
            notificationService.scheduleAllNotifications(for: medication)
            loadMedications()
        } catch {
            errorMessage = "更新药物失败: \(error.localizedDescription)"
        }
    }
    
    func deleteMedication(_ medication: Medication) {
        do {
            notificationService.cancelNotifications(for: medication)
            try databaseService.deleteMedication(id: medication.id)
            loadMedications()
        } catch {
            errorMessage = "删除药物失败: \(error.localizedDescription)"
        }
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
