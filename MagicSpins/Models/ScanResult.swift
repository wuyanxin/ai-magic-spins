import Foundation

struct ScanResult: Identifiable, Codable {
    var id: UUID
    var rawText: String
    var detectedMedicationName: String?
    var detectedDosage: String?
    var detectedFrequency: String?
    var imageData: Data?
    var scanDate: Date
    
    init(id: UUID = UUID(),
         rawText: String = "",
         detectedMedicationName: String? = nil,
         detectedDosage: String? = nil,
         detectedFrequency: String? = nil,
         imageData: Data? = nil,
         scanDate: Date = Date()) {
        self.id = id
        self.rawText = rawText
        self.detectedMedicationName = detectedMedicationName
        self.detectedDosage = detectedDosage
        self.detectedFrequency = detectedFrequency
        self.imageData = imageData
        self.scanDate = scanDate
    }
}
