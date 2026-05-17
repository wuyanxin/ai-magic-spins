import Foundation
import SQLite

class DatabaseService {
    static let shared = DatabaseService()
    private var db: Connection?
    
    // Tables
    private let medications = Table("medications")
    private let reminderTimes = Table("reminder_times")
    private let doseRecords = Table("dose_records")
    
    // Medication columns
    private let medId = Expression<String>("id")
    private let medName = Expression<String>("name")
    private let medDosage = Expression<String>("dosage")
    private let medFrequency = Expression<String>("frequency")
    private let medCategory = Expression<String>("category")
    private let medNotes = Expression<String?>("notes")
    private let medIsActive = Expression<Bool>("isActive")
    private let medCreatedAt = Expression<String>("createdAt")
    private let medUpdatedAt = Expression<String>("updatedAt")
    
    // Reminder times columns
    private let remId = Expression<String>("id")
    private let remMedicationId = Expression<String>("medicationId")
    private let remTime = Expression<String>("time")
    
    // Dose records columns
    private let doseId = Expression<String>("id")
    private let doseMedicationId = Expression<String>("medicationId")
    private let doseScheduledTime = Expression<String>("scheduledTime")
    private let doseActualTime = Expression<String?>("actualTime")
    private let doseStatus = Expression<String>("status")
    private let doseSkippedReason = Expression<String?>("skippedReason")
    private let doseCreatedAt = Expression<String>("createdAt")
    
    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
    private init() {
        setupDatabase()
    }
    
    private func setupDatabase() {
        do {
            let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
            db = try Connection("\(path)/magicSpins.sqlite3")
            try createTables()
        } catch {
            print("Database setup failed: \(error)")
        }
    }
    
    private func createTables() throws {
        try db?.run(medications.create(ifNotExists: true) { t in
            t.column(medId, primaryKey: true)
            t.column(medName)
            t.column(medDosage)
            t.column(medFrequency)
            t.column(medCategory)
            t.column(medNotes)
            t.column(medIsActive)
            t.column(medCreatedAt)
            t.column(medUpdatedAt)
        })
        
        try db?.run(reminderTimes.create(ifNotExists: true) { t in
            t.column(remId, primaryKey: true)
            t.column(remMedicationId)
            t.column(remTime)
        })
        
        try db?.run(doseRecords.create(ifNotExists: true) { t in
            t.column(doseId, primaryKey: true)
            t.column(doseMedicationId)
            t.column(doseScheduledTime)
            t.column(doseActualTime)
            t.column(doseStatus)
            t.column(doseSkippedReason)
            t.column(doseCreatedAt)
        })
    }
    
    // MARK: - Medication CRUD
    
    func addMedication(_ medication: Medication) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        try db.run(medications.insert(
            medId <- medication.id.uuidString,
            medName <- medication.name,
            medDosage <- medication.dosage,
            medFrequency <- medication.frequency.rawValue,
            medCategory <- medication.category.rawValue,
            medNotes <- medication.notes,
            medIsActive <- medication.isActive,
            medCreatedAt <- dateFormatter.string(from: medication.createdAt),
            medUpdatedAt <- dateFormatter.string(from: medication.updatedAt)
        ))
        
        for time in medication.reminderTimes {
            try db.run(reminderTimes.insert(
                remId <- UUID().uuidString,
                remMedicationId <- medication.id.uuidString,
                remTime <- dateFormatter.string(from: time)
            ))
        }
    }
    
    func updateMedication(_ medication: Medication) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = medications.filter(medId == medication.id.uuidString)
        try db.run(query.update(
            medName <- medication.name,
            medDosage <- medication.dosage,
            medFrequency <- medication.frequency.rawValue,
            medCategory <- medication.category.rawValue,
            medNotes <- medication.notes,
            medIsActive <- medication.isActive,
            medUpdatedAt <- dateFormatter.string(from: medication.updatedAt)
        ))
        
        try db.run(reminderTimes.filter(remMedicationId == medication.id.uuidString).delete())
        for time in medication.reminderTimes {
            try db.run(reminderTimes.insert(
                remId <- UUID().uuidString,
                remMedicationId <- medication.id.uuidString,
                remTime <- dateFormatter.string(from: time)
            ))
        }
    }
    
    func deleteMedication(id: UUID) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        try db.run(medications.filter(medId == id.uuidString).delete())
        try db.run(reminderTimes.filter(remMedicationId == id.uuidString).delete())
        try db.run(doseRecords.filter(doseMedicationId == id.uuidString).delete())
    }
    
    func fetchAllMedications() throws -> [Medication] {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        var result: [Medication] = []
        
        for row in try db.prepare(medications) {
            let medicationId = UUID(uuidString: row[medId])!
            let times = try fetchReminderTimes(for: medicationId)
            
            let medication = Medication(
                id: medicationId,
                name: row[medName],
                dosage: row[medDosage],
                frequency: Frequency(rawValue: row[medFrequency]) ?? .daily,
                reminderTimes: times,
                category: MedicationCategory(rawValue: row[medCategory]) ?? .other,
                notes: row[medNotes],
                isActive: row[medIsActive],
                createdAt: dateFormatter.date(from: row[medCreatedAt]) ?? Date(),
                updatedAt: dateFormatter.date(from: row[medUpdatedAt]) ?? Date()
            )
            result.append(medication)
        }
        
        return result
    }
    
    private func fetchReminderTimes(for medicationId: UUID) throws -> [Date] {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        var times: [Date] = []
        let query = reminderTimes.filter(remMedicationId == medicationId.uuidString)
        
        for row in try db.prepare(query) {
            if let date = dateFormatter.date(from: row[remTime]) {
                times.append(date)
            }
        }
        
        return times.sorted()
    }
    
    // MARK: - Dose Records CRUD
    
    func addDoseRecord(_ record: DoseRecord) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        try db.run(doseRecords.insert(
            doseId <- record.id.uuidString,
            doseMedicationId <- record.medicationId.uuidString,
            doseScheduledTime <- dateFormatter.string(from: record.scheduledTime),
            doseActualTime <- record.actualTime.map { dateFormatter.string(from: $0) },
            doseStatus <- record.status.rawValue,
            doseSkippedReason <- record.skippedReason,
            doseCreatedAt <- dateFormatter.string(from: record.createdAt)
        ))
    }
    
    func updateDoseRecord(_ record: DoseRecord) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = doseRecords.filter(doseId == record.id.uuidString)
        try db.run(query.update(
            doseActualTime <- record.actualTime.map { dateFormatter.string(from: $0) },
            doseStatus <- record.status.rawValue,
            doseSkippedReason <- record.skippedReason
        ))
    }
    
    func fetchDoseRecords(for date: Date) throws -> [DoseRecord] {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let startOfDay = date.startOfDay
        let endOfDay = date.endOfDay
        
        var result: [DoseRecord] = []
        let query = doseRecords.filter(
            doseScheduledTime >= dateFormatter.string(from: startOfDay) &&
            doseScheduledTime <= dateFormatter.string(from: endOfDay)
        )
        
        for row in try db.prepare(query) {
            let record = DoseRecord(
                id: UUID(uuidString: row[doseId])!,
                medicationId: UUID(uuidString: row[doseMedicationId])!,
                scheduledTime: dateFormatter.date(from: row[doseScheduledTime]) ?? Date(),
                actualTime: row[doseActualTime].flatMap { dateFormatter.date(from: $0) },
                status: DoseStatus(rawValue: row[doseStatus]) ?? .pending,
                skippedReason: row[doseSkippedReason],
                createdAt: dateFormatter.date(from: row[doseCreatedAt]) ?? Date()
            )
            result.append(record)
        }
        
        return result
    }
    
    func fetchDoseRecords(from startDate: Date, to endDate: Date) throws -> [DoseRecord] {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        var result: [DoseRecord] = []
        let query = doseRecords.filter(
            doseScheduledTime >= dateFormatter.string(from: startDate) &&
            doseScheduledTime <= dateFormatter.string(from: endDate)
        )
        
        for row in try db.prepare(query) {
            let record = DoseRecord(
                id: UUID(uuidString: row[doseId])!,
                medicationId: UUID(uuidString: row[doseMedicationId])!,
                scheduledTime: dateFormatter.date(from: row[doseScheduledTime]) ?? Date(),
                actualTime: row[doseActualTime].flatMap { dateFormatter.date(from: $0) },
                status: DoseStatus(rawValue: row[doseStatus]) ?? .pending,
                skippedReason: row[doseSkippedReason],
                createdAt: dateFormatter.date(from: row[doseCreatedAt]) ?? Date()
            )
            result.append(record)
        }
        
        return result
    }
    
    // MARK: - Statistics
    
    func calculateComplianceRate(from startDate: Date, to endDate: Date) throws -> Double {
        let records = try fetchDoseRecords(from: startDate, to: endDate)
        guard !records.isEmpty else { return 0.0 }
        
        let completedCount = records.filter { $0.status == .taken || $0.status == .skipped }.count
        return Double(completedCount) / Double(records.count) * 100
    }
}

enum DatabaseError: Error {
    case connectionFailed
    case queryFailed
    case insertFailed
    case updateFailed
    case deleteFailed
}
