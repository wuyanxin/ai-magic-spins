import Foundation
import Combine

class HistoryViewModel: ObservableObject {
    @Published var selectedPeriod: HistoryPeriod = .week
    @Published var doseRecords: [DoseRecord] = []
    @Published var complianceRate: Double = 0
    @Published var totalDoses: Int = 0
    @Published var takenDoses: Int = 0
    @Published var skippedDoses: Int = 0
    @Published var missedDoses: Int = 0
    
    private let databaseService = DatabaseService.shared
    
    init() {
        loadHistory()
    }
    
    func loadHistory() {
        let (startDate, endDate) = getDateRange()
        doseRecords = databaseService.fetchDoseRecords(from: startDate, to: endDate)
        calculateStatistics()
    }
    
    func calculateStatistics() {
        totalDoses = doseRecords.count
        takenDoses = doseRecords.filter { $0.status == .taken }.count
        skippedDoses = doseRecords.filter { $0.status == .skipped }.count
        missedDoses = doseRecords.filter { $0.status == .missed }.count
        
        if totalDoses > 0 {
            complianceRate = Double(takenDoses + skippedDoses) / Double(totalDoses) * 100
        } else {
            complianceRate = 0
        }
    }
    
    func getDateRange() -> (Date, Date) {
        let calendar = Calendar.current
        let today = Date()
        
        switch selectedPeriod {
        case .week:
            let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
            return (startOfWeek, today)
        case .month:
            let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: today))!
            return (startOfMonth, today)
        case .all:
            let startOfYear = calendar.date(from: calendar.dateComponents([.year], from: today))!
            return (startOfYear, today)
        }
    }
    
    func recordsGroupedByDate() -> [(Date, [DoseRecord])] {
        let grouped = Dictionary(grouping: doseRecords) { record in
            Calendar.current.startOfDay(for: record.scheduledTime)
        }
        
        return grouped.sorted { $0.key > $1.key }.map { ($0.key, $0.value) }
    }
}

enum HistoryPeriod: String, CaseIterable, Identifiable {
    case week = "本周"
    case month = "本月"
    case all = "全部"
    
    var id: String { rawValue }
}
