import Foundation

class DatabaseService {
    static let shared = DatabaseService()
    private let userDefaults = UserDefaults.standard
    private let medicationsKey = "medications"
    private let doseRecordsKey = "doseRecords"
    
    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
    private init() {}
    
    private func encodeDate(_ date: Date) -> String {
        return dateFormatter.string(from: date)
    }
    
    private func decodeDate(_ string: String) -> Date? {
        return dateFormatter.date(from: string)
    }
    
    func addMedication(_ medication: Medication) {
        var medications = fetchAllMedications()
        medications.append(medication)
        saveMedications(medications)
    }
    
    func updateMedication(_ medication: Medication) {
        var medications = fetchAllMedications()
        if let index = medications.firstIndex(where: { $0.id == medication.id }) {
            medications[index] = medication
            saveMedications(medications)
        }
    }
    
    func deleteMedication(id: UUID) {
        var medications = fetchAllMedications()
        medications.removeAll { $0.id == id }
        saveMedications(medications)
        
        var records = fetchAllDoseRecords()
        records.removeAll { $0.medicationId == id }
        saveDoseRecords(records)
    }
    
    func fetchAllMedications(memberId: UUID? = nil) -> [Medication] {
        guard let data = userDefaults.data(forKey: medicationsKey) else {
            return []
        }
        do {
            let medications = try JSONDecoder().decode([Medication].self, from: data)
            if let memberId = memberId {
                return medications.filter { $0.memberId == memberId }
            }
            return medications
        } catch {
            print("Failed to decode medications: \(error)")
            return []
        }
    }
    
    func fetchMedications(for memberId: UUID) -> [Medication] {
        return fetchAllMedications(memberId: memberId)
    }
    
    private func saveMedications(_ medications: [Medication]) {
        do {
            let data = try JSONEncoder().encode(medications)
            userDefaults.set(data, forKey: medicationsKey)
        } catch {
            print("Failed to save medications: \(error)")
        }
    }
    
    func addDoseRecord(_ record: DoseRecord) {
        var records = fetchAllDoseRecords()
        records.append(record)
        saveDoseRecords(records)
    }
    
    func updateDoseRecord(_ record: DoseRecord) {
        var records = fetchAllDoseRecords()
        if let index = records.firstIndex(where: { $0.id == record.id }) {
            records[index] = record
            saveDoseRecords(records)
        }
    }
    
    func fetchDoseRecords(for date: Date, memberId: UUID? = nil) -> [DoseRecord] {
        let records = fetchAllDoseRecords()
        let startOfDay = date.startOfDay
        let endOfDay = date.endOfDay
        
        var filteredRecords = records.filter { $0.scheduledTime >= startOfDay && $0.scheduledTime <= endOfDay }
        
        if let memberId = memberId {
            filteredRecords = filteredRecords.filter { $0.memberId == memberId }
        }
        
        return filteredRecords
    }
    
    func fetchDoseRecords(from startDate: Date, to endDate: Date, memberId: UUID? = nil) -> [DoseRecord] {
        var records = fetchAllDoseRecords().filter { $0.scheduledTime >= startDate && $0.scheduledTime <= endDate }
        
        if let memberId = memberId {
            records = records.filter { $0.memberId == memberId }
        }
        
        return records
    }
    
    func fetchDoseRecords(for memberId: UUID) -> [DoseRecord] {
        let records = fetchAllDoseRecords()
        return records.filter { $0.memberId == memberId }
    }
    
    private func fetchAllDoseRecords() -> [DoseRecord] {
        guard let data = userDefaults.data(forKey: doseRecordsKey) else {
            return []
        }
        do {
            let records = try JSONDecoder().decode([DoseRecord].self, from: data)
            return records
        } catch {
            print("Failed to decode dose records: \(error)")
            return []
        }
    }
    
    private func saveDoseRecords(_ records: [DoseRecord]) {
        do {
            let data = try JSONEncoder().encode(records)
            userDefaults.set(data, forKey: doseRecordsKey)
        } catch {
            print("Failed to save dose records: \(error)")
        }
    }
    
    func calculateComplianceRate(from startDate: Date, to endDate: Date, memberId: UUID? = nil) -> Double {
        let records = fetchDoseRecords(from: startDate, to: endDate, memberId: memberId)
        guard !records.isEmpty else { return 0.0 }
        
        let completedCount = records.filter { $0.status == .taken || $0.status == .skipped }.count
        return Double(completedCount) / Double(records.count) * 100
    }
    
    func deleteMedicationsByMember(memberId: UUID) {
        var medications = fetchAllMedications()
        medications.removeAll { $0.memberId == memberId }
        saveMedications(medications)
    }
    
    func deleteDoseRecordsByMember(memberId: UUID) {
        var records = fetchAllDoseRecords()
        records.removeAll { $0.memberId == memberId }
        saveDoseRecords(records)
    }
}
