import Foundation

struct Medication: Identifiable, Codable, Equatable {
    var id: UUID
    var name: String
    var dosage: String
    var frequency: Frequency
    var reminderTimes: [Date]
    var category: MedicationCategory
    var notes: String?
    var isActive: Bool
    var createdAt: Date
    var updatedAt: Date
    
    init(id: UUID = UUID(),
         name: String,
         dosage: String,
         frequency: Frequency,
         reminderTimes: [Date],
         category: MedicationCategory,
         notes: String? = nil,
         isActive: Bool = true,
         createdAt: Date = Date(),
         updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.dosage = dosage
        self.frequency = frequency
        self.reminderTimes = reminderTimes
        self.category = category
        self.notes = notes
        self.isActive = isActive
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
