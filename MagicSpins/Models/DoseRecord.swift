import Foundation

struct DoseRecord: Identifiable, Codable, Equatable {
    var id: UUID
    var medicationId: UUID
    var memberId: UUID?
    var scheduledTime: Date
    var actualTime: Date?
    var status: DoseStatus
    var skippedReason: String?
    var createdAt: Date
    
    init(id: UUID = UUID(),
         medicationId: UUID,
         memberId: UUID? = nil,
         scheduledTime: Date,
         actualTime: Date? = nil,
         status: DoseStatus = .pending,
         skippedReason: String? = nil,
         createdAt: Date = Date()) {
        self.id = id
        self.medicationId = medicationId
        self.memberId = memberId
        self.scheduledTime = scheduledTime
        self.actualTime = actualTime
        self.status = status
        self.skippedReason = skippedReason
        self.createdAt = createdAt
    }
}
