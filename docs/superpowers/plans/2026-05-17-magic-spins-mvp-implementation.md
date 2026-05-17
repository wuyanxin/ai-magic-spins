# MagicSpins MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working iOS medication management app MVP with medication tracking, reminders, and compliance statistics in 2.5 hours.

**Architecture:** SwiftUI-based iOS app using MVVM pattern with local SQLite database for persistence and UserNotifications for medication reminders. Single-user mode with Apple Sign In for authentication.

**Tech Stack:** Swift 5.9+, SwiftUI, SQLite.swift, UserNotifications, AuthenticationServices

---

## 1. File Structure

```
MagicSpins/
├── App/
│   └── MagicSpinsApp.swift              # App entry point
├── Models/
│   ├── Medication.swift                 # Medication data model
│   ├── DoseRecord.swift                 # Dose record data model
│   └── Enums.swift                     # Frequency, Category, Status enums
├── Services/
│   ├── DatabaseService.swift            # SQLite database operations
│   ├── NotificationService.swift        # Local notification management
│   └── AuthenticationService.swift      # Apple Sign In
├── ViewModels/
│   ├── MedicationViewModel.swift        # Medication list logic
│   ├── ReminderViewModel.swift           # Reminder management logic
│   └── HistoryViewModel.swift           # History and stats logic
├── Views/
│   ├── ContentView.swift                # Tab bar container
│   ├── Home/
│   │   ├── HomeView.swift               # Today's medication plan
│   │   └── MedicationCard.swift         # Medication card component
│   ├── Medication/
│   │   ├── MedicationListView.swift    # Medication list
│   │   ├── AddMedicationView.swift      # Add/Edit medication form
│   │   └── MedicationDetailView.swift   # Medication details
│   ├── History/
│   │   └── HistoryView.swift           # History and statistics
│   └── Settings/
│       └── SettingsView.swift           # App settings
├── Utilities/
│   ├── Constants.swift                  # App-wide constants
│   └── Extensions.swift                 # Swift extensions
└── Resources/
    └── Assets.xcassets                 # Image assets
```

---

## 2. Task Decomposition

### Task 1: Initialize Xcode Project Structure

**Files:**
- Create: `MagicSpins/App/MagicSpinsApp.swift`
- Create: `MagicSpins/Models/Enums.swift`
- Create: `MagicSpins/Models/Medication.swift`
- Create: `MagicSpins/Models/DoseRecord.swift`
- Create: `MagicSpins/Utilities/Constants.swift`
- Create: `MagicSpins/Utilities/Extensions.swift`

- [ ] **Step 1: Create MagicSpinsApp.swift**

```swift
import SwiftUI

@main
struct MagicSpinsApp: App {
    @StateObject private var medicationViewModel = MedicationViewModel()
    @StateObject private var reminderViewModel = ReminderViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(medicationViewModel)
                .environmentObject(reminderViewModel)
        }
    }
}
```

- [ ] **Step 2: Create Enums.swift**

```swift
import Foundation

enum Frequency: String, CaseIterable, Identifiable {
    case daily = "每日一次"
    case twiceDaily = "每日两次"
    case threeTimesDaily = "每日三次"
    case fourTimesDaily = "每日四次"
    case asNeeded = "必要时"
    
    var id: String { rawValue }
}

enum MedicationCategory: String, CaseIterable, Identifiable {
    case morning = "早餐"
    case lunch = "午餐"
    case dinner = "晚餐"
    case bedtime = "睡前"
    case other = "其他"
    
    var id: String { rawValue }
}

enum DoseStatus: String, CaseIterable, Identifiable {
    case taken = "已服用"
    case skipped = "跳过"
    case missed = "未服用"
    case pending = "待服用"
    
    var id: String { rawValue }
}
```

- [ ] **Step 3: Create Medication.swift**

```swift
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
```

- [ ] **Step 4: Create DoseRecord.swift**

```swift
import Foundation

struct DoseRecord: Identifiable, Codable, Equatable {
    var id: UUID
    var medicationId: UUID
    var scheduledTime: Date
    var actualTime: Date?
    var status: DoseStatus
    var skippedReason: String?
    var createdAt: Date
    
    init(id: UUID = UUID(),
         medicationId: UUID,
         scheduledTime: Date,
         actualTime: Date? = nil,
         status: DoseStatus = .pending,
         skippedReason: String? = nil,
         createdAt: Date = Date()) {
        self.id = id
        self.medicationId = medicationId
        self.scheduledTime = scheduledTime
        self.actualTime = actualTime
        self.status = status
        self.skippedReason = skippedReason
        self.createdAt = createdAt
    }
}
```

- [ ] **Step 5: Create Constants.swift**

```swift
import SwiftUI

struct AppColors {
    static let primary = Color(hex: "007AFF")
    static let success = Color(hex: "34C759")
    static let warning = Color(hex: "FF9500")
    static let danger = Color(hex: "FF3B30")
    static let background = Color(hex: "F2F2F7")
    static let primaryText = Color(hex: "1C1C1E")
    static let secondaryText = Color(hex: "8E8E93")
}

struct AppConstants {
    static let maxReminderTimes = 4
    static let reminderSnoozeMinutes = 30
}
```

- [ ] **Step 6: Create Extensions.swift**

```swift
import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

extension Date {
    var timeString: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }
    
    var dateString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: self)
    }
    
    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }
    
    var endOfDay: Date {
        var components = DateComponents()
        components.day = 1
        components.second = -1
        return Calendar.current.date(byAdding: components, to: startOfDay)!
    }
}

extension View {
    func cardStyle() -> some View {
        self
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}
```

---

### Task 2: Implement Database Service

**Files:**
- Create: `MagicSpins/Services/DatabaseService.swift`

- [ ] **Step 1: Create DatabaseService.swift**

```swift
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
```

---

### Task 3: Implement Notification Service

**Files:**
- Create: `MagicSpins/Services/NotificationService.swift`

- [ ] **Step 1: Create NotificationService.swift**

```swift
import Foundation
import UserNotifications

class NotificationService: NSObject, ObservableObject {
    static let shared = NotificationService()
    
    @Published var isAuthorized = false
    
    override init() {
        super.init()
        checkAuthorizationStatus()
    }
    
    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            DispatchQueue.main.async {
                self.isAuthorized = granted
                completion(granted)
            }
            
            if let error = error {
                print("Notification authorization error: \(error)")
            }
        }
    }
    
    func checkAuthorizationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.isAuthorized = settings.authorizationStatus == .authorized
            }
        }
    }
    
    func scheduleNotification(for medication: Medication, at time: Date) {
        let content = UNMutableNotificationContent()
        content.title = "📋 该服药啦"
        content.body = "\(medication.name) \(medication.dosage)，请按时服用"
        content.sound = .default
        content.categoryIdentifier = "MEDICATION_REMINDER"
        content.userInfo = [
            "medicationId": medication.id.uuidString,
            "medicationName": medication.name,
            "dosage": medication.dosage,
            "scheduledTime": time.timeString
        ]
        
        var dateComponents = Calendar.current.dateComponents([.hour, .minute], from: time)
        dateComponents.second = 0
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        
        let identifier = "\(medication.id.uuidString)_\(time.timeString.replacingOccurrences(of: ":", with: "-"))"
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule notification: \(error)")
            } else {
                print("Notification scheduled for \(medication.name) at \(time.timeString)")
            }
        }
    }
    
    func scheduleAllNotifications(for medication: Medication) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [medication.id.uuidString])
        
        for time in medication.reminderTimes {
            scheduleNotification(for: medication, at: time)
        }
    }
    
    func cancelNotifications(for medication: Medication) {
        let identifiers = medication.reminderTimes.map { time in
            "\(medication.id.uuidString)_\(time.timeString.replacingOccurrences(of: ":", with: "-"))"
        }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: identifiers)
    }
    
    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
    
    func setupNotificationCategories() {
        let takenAction = UNNotificationAction(
            identifier: "TAKEN_ACTION",
            title: "✅ 已服用",
            options: .foreground
        )
        
        let skipAction = UNNotificationAction(
            identifier: "SKIP_ACTION",
            title: "⏭️ 跳过",
            options: []
        )
        
        let snoozeAction = UNNotificationAction(
            identifier: "SNOOZE_ACTION",
            title: "⏰ 延后30分钟",
            options: []
        )
        
        let category = UNNotificationCategory(
            identifier: "MEDICATION_REMINDER",
            actions: [takenAction, skipAction, snoozeAction],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([category])
    }
}
```

---

### Task 4: Implement ViewModels

**Files:**
- Create: `MagicSpins/ViewModels/MedicationViewModel.swift`
- Create: `MagicSpins/ViewModels/ReminderViewModel.swift`
- Create: `MagicSpins/ViewModels/HistoryViewModel.swift`

- [ ] **Step 1: Create MedicationViewModel.swift**

```swift
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
```

- [ ] **Step 2: Create ReminderViewModel.swift**

```swift
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
        do {
            todayDoseRecords = try databaseService.fetchDoseRecords(for: Date())
            categorizeDoses()
        } catch {
            print("Failed to load today's records: \(error)")
        }
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
                
                do {
                    try databaseService.addDoseRecord(record)
                } catch {
                    print("Failed to create dose record: \(error)")
                }
            }
        }
        
        loadTodayRecords()
    }
    
    func markAsTaken(recordId: UUID) {
        if var record = todayDoseRecords.first(where: { $0.id == recordId }) {
            record.status = .taken
            record.actualTime = Date()
            
            do {
                try databaseService.updateDoseRecord(record)
                loadTodayRecords()
            } catch {
                print("Failed to update record: \(error)")
            }
        }
    }
    
    func markAsSkipped(recordId: UUID, reason: String?) {
        if var record = todayDoseRecords.first(where: { $0.id == recordId }) {
            record.status = .skipped
            record.skippedReason = reason
            
            do {
                try databaseService.updateDoseRecord(record)
                loadTodayRecords()
            } catch {
                print("Failed to update record: \(error)")
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
```

- [ ] **Step 3: Create HistoryViewModel.swift**

```swift
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
        
        do {
            doseRecords = try databaseService.fetchDoseRecords(from: startDate, to: endDate)
            calculateStatistics()
        } catch {
            print("Failed to load history: \(error)")
        }
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
```

---

### Task 5: Implement UI Views

**Files:**
- Create: `MagicSpins/Views/ContentView.swift`
- Create: `MagicSpins/Views/Home/HomeView.swift`
- Create: `MagicSpins/Views/Home/MedicationCard.swift`
- Create: `MagicSpins/Views/Medication/MedicationListView.swift`
- Create: `MagicSpins/Views/Medication/AddMedicationView.swift`
- Create: `MagicSpins/Views/Medication/MedicationDetailView.swift`
- Create: `MagicSpins/Views/History/HistoryView.swift`
- Create: `MagicSpins/Views/Settings/SettingsView.swift`

- [ ] **Step 1: Create ContentView.swift**

```swift
import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("首页", systemImage: "house.fill")
                }
                .tag(0)
            
            MedicationListView()
                .tabItem {
                    Label("药物", systemImage: "pills.fill")
                }
                .tag(1)
            
            HistoryView()
                .tabItem {
                    Label("历史", systemImage: "clock.fill")
                }
                .tag(2)
            
            SettingsView()
                .tabItem {
                    Label("设置", systemImage: "gearshape.fill")
                }
                .tag(3)
        }
        .tint(AppColors.primary)
    }
}

#Preview {
    ContentView()
        .environmentObject(MedicationViewModel())
        .environmentObject(ReminderViewModel())
}
```

- [ ] **Step 2: Create HomeView.swift**

```swift
import SwiftUI

struct HomeView: View {
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    @EnvironmentObject var reminderViewModel: ReminderViewModel
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    headerSection
                    
                    // Today's Progress
                    progressSection
                    
                    // Today's Medications
                    medicationListSection
                }
                .padding()
            }
            .background(AppColors.background)
            .navigationTitle("今日用药")
            .refreshable {
                medicationViewModel.loadMedications()
                reminderViewModel.loadTodayRecords()
            }
        }
    }
    
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(Date(), style: .date)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(AppColors.primaryText)
            
            Text("记得按时服药哦！💊")
                .font(.subheadline)
                .foregroundColor(AppColors.secondaryText)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    private var progressSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("今日遵从率")
                    .font(.headline)
                    .foregroundColor(AppColors.primaryText)
                
                Spacer()
                
                Text("\(Int(reminderViewModel.getCompletionRate()))%")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(completionRateColor)
            }
            
            ProgressView(value: reminderViewModel.getCompletionRate(), total: 100)
                .tint(completionRateColor)
                .scaleEffect(x: 1, y: 2, anchor: .center)
            
            HStack {
                Label("\(reminderViewModel.completedDoses.count)", systemImage: "checkmark.circle.fill")
                    .foregroundColor(AppColors.success)
                
                Spacer()
                
                Label("\(reminderViewModel.skippedDoses.count)", systemImage: "forward.fill")
                    .foregroundColor(AppColors.warning)
                
                Spacer()
                
                Label("\(reminderViewModel.pendingDoses.count)", systemImage: "clock.fill")
                    .foregroundColor(AppColors.primary)
            }
            .font(.caption)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
    }
    
    private var medicationListSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("今日计划")
                .font(.headline)
                .foregroundColor(AppColors.primaryText)
            
            if medicationViewModel.todayMedications.isEmpty {
                emptyStateView
            } else {
                ForEach(medicationViewModel.todayMedications) { medication in
                    MedicationCard(medication: medication)
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "pills")
                .font(.system(size: 60))
                .foregroundColor(AppColors.secondaryText.opacity(0.5))
            
            Text("还没有添加药物")
                .font(.headline)
                .foregroundColor(AppColors.secondaryText)
            
            Text("点击下方「药物」标签添加您的第一个药物")
                .font(.subheadline)
                .foregroundColor(AppColors.secondaryText)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
    
    private var completionRateColor: Color {
        let rate = reminderViewModel.getCompletionRate()
        if rate >= 80 {
            return AppColors.success
        } else if rate >= 50 {
            return AppColors.warning
        } else {
            return AppColors.danger
        }
    }
}

#Preview {
    HomeView()
        .environmentObject(MedicationViewModel())
        .environmentObject(ReminderViewModel())
}
```

- [ ] **Step 3: Create MedicationCard.swift**

```swift
import SwiftUI

struct MedicationCard: View {
    let medication: Medication
    @EnvironmentObject var reminderViewModel: ReminderViewModel
    @State private var showingDetail = false
    @State private var showingSkipSheet = false
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(medication.name)
                        .font(.headline)
                        .foregroundColor(AppColors.primaryText)
                    
                    Text(medication.dosage)
                        .font(.subheadline)
                        .foregroundColor(AppColors.secondaryText)
                }
                
                Spacer()
                
                categoryBadge
            }
            
            Divider()
            
            HStack {
                Label(medication.frequency.rawValue, systemImage: "repeat")
                    .font(.caption)
                    .foregroundColor(AppColors.secondaryText)
                
                Spacer()
                
                Text(medication.reminderTimes.first?.timeString ?? "")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(AppColors.primary)
            }
            
            actionButtons
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
        .onTapGesture {
            showingDetail = true
        }
        .sheet(isPresented: $showingDetail) {
            MedicationDetailView(medication: medication)
        }
        .sheet(isPresented: $showingSkipSheet) {
            skipReasonSheet
        }
    }
    
    private var categoryBadge: some View {
        Text(medication.category.rawValue)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(categoryColor.opacity(0.1))
            .foregroundColor(categoryColor)
            .cornerRadius(8)
    }
    
    private var categoryColor: Color {
        switch medication.category {
        case .morning: return .orange
        case .lunch: return .blue
        case .dinner: return .green
        case .bedtime: return .purple
        case .other: return .gray
        }
    }
    
    private var actionButtons: some View {
        HStack(spacing: 12) {
            Button(action: markAsTaken) {
                Label("已服用", systemImage: "checkmark")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(AppColors.success)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            
            Button(action: { showingSkipSheet = true }) {
                Label("跳过", systemImage: "forward")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(AppColors.warning.opacity(0.2))
                    .foregroundColor(AppColors.warning)
                    .cornerRadius(8)
            }
        }
    }
    
    private var skipReasonSheet: some View {
        NavigationStack {
            List {
                Button("忘记服药") {
                    skipWithReason("忘记服药")
                }
                Button("身体不适") {
                    skipWithReason("身体不适")
                }
                Button("医生建议停药") {
                    skipWithReason("医生建议停药")
                }
                Button("其他原因") {
                    skipWithReason("其他原因")
                }
            }
            .navigationTitle("跳过原因")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        showingSkipSheet = false
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }
    
    private func markAsTaken() {
        if let firstTime = medication.reminderTimes.first,
           let record = reminderViewModel.getRecord(for: medication.id, at: firstTime) {
            reminderViewModel.markAsTaken(recordId: record.id)
        }
    }
    
    private func skipWithReason(_ reason: String) {
        if let firstTime = medication.reminderTimes.first,
           let record = reminderViewModel.getRecord(for: medication.id, at: firstTime) {
            reminderViewModel.markAsSkipped(recordId: record.id, reason: reason)
        }
        showingSkipSheet = false
    }
}

#Preview {
    MedicationCard(medication: Medication(
        name: "阿司匹林",
        dosage: "100mg",
        frequency: .daily,
        reminderTimes: [Date()],
        category: .morning
    ))
    .environmentObject(ReminderViewModel())
    .padding()
}
```

- [ ] **Step 4: Create MedicationListView.swift**

```swift
import SwiftUI

struct MedicationListView: View {
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    @State private var showingAddMedication = false
    @State private var searchText = ""
    
    var body: some View {
        NavigationStack {
            List {
                if medicationViewModel.medications.isEmpty {
                    emptyStateView
                } else {
                    ForEach(groupedMedications.keys.sorted(by: { $0.rawValue < $1.rawValue }), id: \.self) { category in
                        Section(header: Text(category.rawValue)) {
                            ForEach(groupedMedications[category] ?? []) { medication in
                                NavigationLink(destination: MedicationDetailView(medication: medication)) {
                                    MedicationRowView(medication: medication)
                                }
                            }
                            .onDelete { indexSet in
                                deleteMedications(at: indexSet, in: category)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .searchable(text: $searchText, prompt: "搜索药物")
            .navigationTitle("药物管理")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddMedication = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }
            }
            .sheet(isPresented: $showingAddMedication) {
                AddMedicationView()
            }
            .refreshable {
                medicationViewModel.loadMedications()
            }
        }
    }
    
    private var groupedMedications: [MedicationCategory: [Medication]] {
        let filtered = searchText.isEmpty ? medicationViewModel.medications :
            medicationViewModel.medications.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        return Dictionary(grouping: filtered, by: { $0.category })
    }
    
    private var emptyStateView: some View {
        ContentUnavailableView {
            Label("暂无药物", systemImage: "pills")
        } description: {
            Text("点击右上角「+」添加您的第一个药物")
        } actions: {
            Button("添加药物") {
                showingAddMedication = true
            }
            .buttonStyle(.borderedProminent)
        }
    }
    
    private func deleteMedications(at offsets: IndexSet, in category: MedicationCategory) {
        guard let medications = groupedMedications[category] else { return }
        for index in offsets {
            let medication = medications[index]
            medicationViewModel.deleteMedication(medication)
        }
    }
}

struct MedicationRowView: View {
    let medication: Medication
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(medication.name)
                    .font(.headline)
                
                Spacer()
                
                if medication.isActive {
                    Circle()
                        .fill(AppColors.success)
                        .frame(width: 8, height: 8)
                } else {
                    Circle()
                        .fill(AppColors.secondaryText)
                        .frame(width: 8, height: 8)
                }
            }
            
            Text(medication.dosage)
                .font(.subheadline)
                .foregroundColor(AppColors.secondaryText)
            
            HStack {
                Text(medication.frequency.rawValue)
                    .font(.caption)
                    .foregroundColor(AppColors.secondaryText)
                
                Spacer()
                
                if let nextTime = medication.reminderTimes.first {
                    Text("下次: \(nextTime.timeString)")
                        .font(.caption)
                        .foregroundColor(AppColors.primary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    MedicationListView()
        .environmentObject(MedicationViewModel())
}
```

- [ ] **Step 5: Create AddMedicationView.swift**

```swift
import SwiftUI

struct AddMedicationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    
    @State private var name = ""
    @State private var dosage = ""
    @State private var frequency: Frequency = .daily
    @State private var category: MedicationCategory = .morning
    @State private var notes = ""
    @State private var reminderTimes: [Date] = [Date()]
    @State private var showingTimePicker = false
    
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    private let notificationService = NotificationService.shared
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("基本信息")) {
                    TextField("药物名称", text: $name)
                        .autocapitalization(.words)
                    
                    TextField("剂量 (如: 500mg)", text: $dosage)
                        .autocapitalization(.none)
                    
                    Picker("服药频率", selection: $frequency) {
                        ForEach(Frequency.allCases) { freq in
                            Text(freq.rawValue).tag(freq)
                        }
                    }
                    
                    Picker("分类", selection: $category) {
                        ForEach(MedicationCategory.allCases) { cat in
                            Text(cat.rawValue).tag(cat)
                        }
                    }
                }
                
                Section(header: Text("提醒时间")) {
                    ForEach(reminderTimes.indices, id: \.self) { index in
                        DatePicker(
                            "提醒 \(index + 1)",
                            selection: $reminderTimes[index],
                            displayedComponents: .hourAndMinute
                        )
                    }
                    
                    if reminderTimes.count < AppConstants.maxReminderTimes {
                        Button(action: addReminderTime) {
                            Label("添加提醒时间", systemImage: "plus.circle")
                        }
                    }
                    
                    if reminderTimes.count > 1 {
                        Button(role: .destructive, action: removeLastReminderTime) {
                            Label("删除最后一个", systemImage: "minus.circle")
                        }
                    }
                }
                
                Section(header: Text("备注（可选）")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 80)
                }
                
                Section {
                    Button(action: requestNotificationPermission) {
                        Label("请求通知权限", systemImage: "bell")
                    }
                }
            }
            .navigationTitle("添加药物")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        saveMedication()
                    }
                    .disabled(!isFormValid)
                }
            }
            .alert("提示", isPresented: $showingAlert) {
                Button("确定", role: .cancel) { }
            } message: {
                Text(alertMessage)
            }
        }
    }
    
    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !dosage.trimmingCharacters(in: .whitespaces).isEmpty &&
        !reminderTimes.isEmpty
    }
    
    private func addReminderTime() {
        guard reminderTimes.count < AppConstants.maxReminderTimes else { return }
        
        var components = Calendar.current.dateComponents([.hour, .minute], from: reminderTimes.last ?? Date())
        components.hour = (components.hour ?? 8) + 4
        if let newTime = Calendar.current.date(from: components) {
            reminderTimes.append(newTime)
        }
    }
    
    private func removeLastReminderTime() {
        guard reminderTimes.count > 1 else { return }
        reminderTimes.removeLast()
    }
    
    private func requestNotificationPermission() {
        notificationService.requestAuthorization { granted in
            if !granted {
                alertMessage = "请在设置中开启通知权限以接收用药提醒"
                showingAlert = true
            }
        }
    }
    
    private func saveMedication() {
        guard isFormValid else {
            alertMessage = "请填写必填信息"
            showingAlert = true
            return
        }
        
        let medication = Medication(
            name: name.trimmingCharacters(in: .whitespaces),
            dosage: dosage.trimmingCharacters(in: .whitespaces),
            frequency: frequency,
            reminderTimes: reminderTimes.sorted(),
            category: category,
            notes: notes.isEmpty ? nil : notes
        )
        
        medicationViewModel.addMedication(medication)
        dismiss()
    }
}

#Preview {
    AddMedicationView()
        .environmentObject(MedicationViewModel())
}
```

- [ ] **Step 6: Create MedicationDetailView.swift**

```swift
import SwiftUI

struct MedicationDetailView: View {
    let medication: Medication
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var showingEditSheet = false
    @State private var showingDeleteAlert = false
    
    var body: some View {
        List {
            Section(header: Text("基本信息")) {
                DetailRow(label: "药物名称", value: medication.name)
                DetailRow(label: "剂量", value: medication.dosage)
                DetailRow(label: "频率", value: medication.frequency.rawValue)
                DetailRow(label: "分类", value: medication.category.rawValue)
            }
            
            Section(header: Text("提醒时间")) {
                ForEach(medication.reminderTimes.indices, id: \.self) { index in
                    Label {
                        Text(medication.reminderTimes[index].timeString)
                            .font(.body)
                    } icon: {
                        Image(systemName: "clock.fill")
                            .foregroundColor(AppColors.primary)
                    }
                }
            }
            
            if let notes = medication.notes, !notes.isEmpty {
                Section(header: Text("备注")) {
                    Text(notes)
                        .font(.body)
                        .foregroundColor(AppColors.secondaryText)
                }
            }
            
            Section(header: Text("状态")) {
                HStack {
                    Text("服药提醒")
                    Spacer()
                    if medication.isActive {
                        Text("开启")
                            .foregroundColor(AppColors.success)
                    } else {
                        Text("关闭")
                            .foregroundColor(AppColors.secondaryText)
                    }
                }
            }
            
            Section {
                Button(action: { showingEditSheet = true }) {
                    Label("编辑药物", systemImage: "pencil")
                }
                
                Button(role: .destructive, action: { showingDeleteAlert = true }) {
                    Label("删除药物", systemImage: "trash")
                        .foregroundColor(.red)
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("药物详情")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingEditSheet) {
            EditMedicationView(medication: medication)
        }
        .alert("确认删除", isPresented: $showingDeleteAlert) {
            Button("取消", role: .cancel) { }
            Button("删除", role: .destructive) {
                medicationViewModel.deleteMedication(medication)
                dismiss()
            }
        } message: {
            Text("确定要删除 \(medication.name) 吗？此操作无法撤销。")
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(AppColors.secondaryText)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

struct EditMedicationView: View {
    let medication: Medication
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    
    @State private var name: String
    @State private var dosage: String
    @State private var frequency: Frequency
    @State private var category: MedicationCategory
    @State private var notes: String
    @State private var reminderTimes: [Date]
    
    init(medication: Medication) {
        self.medication = medication
        _name = State(initialValue: medication.name)
        _dosage = State(initialValue: medication.dosage)
        _frequency = State(initialValue: medication.frequency)
        _category = State(initialValue: medication.category)
        _notes = State(initialValue: medication.notes ?? "")
        _reminderTimes = State(initialValue: medication.reminderTimes)
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("基本信息")) {
                    TextField("药物名称", text: $name)
                    TextField("剂量", text: $dosage)
                    Picker("频率", selection: $frequency) {
                        ForEach(Frequency.allCases) { freq in
                            Text(freq.rawValue).tag(freq)
                        }
                    }
                    Picker("分类", selection: $category) {
                        ForEach(MedicationCategory.allCases) { cat in
                            Text(cat.rawValue).tag(cat)
                        }
                    }
                }
                
                Section(header: Text("提醒时间")) {
                    ForEach(reminderTimes.indices, id: \.self) { index in
                        DatePicker(
                            "提醒 \(index + 1)",
                            selection: $reminderTimes[index],
                            displayedComponents: .hourAndMinute
                        )
                    }
                }
                
                Section(header: Text("备注")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 80)
                }
            }
            .navigationTitle("编辑药物")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        saveChanges()
                    }
                }
            }
        }
    }
    
    private func saveChanges() {
        var updatedMedication = medication
        updatedMedication.name = name
        updatedMedication.dosage = dosage
        updatedMedication.frequency = frequency
        updatedMedication.category = category
        updatedMedication.notes = notes.isEmpty ? nil : notes
        updatedMedication.reminderTimes = reminderTimes.sorted()
        updatedMedication.updatedAt = Date()
        
        medicationViewModel.updateMedication(updatedMedication)
        dismiss()
    }
}

#Preview {
    NavigationStack {
        MedicationDetailView(medication: Medication(
            name: "阿司匹林",
            dosage: "100mg",
            frequency: .daily,
            reminderTimes: [Date()],
            category: .morning,
            notes: "饭后服用"
        ))
        .environmentObject(MedicationViewModel())
    }
}
```

- [ ] **Step 7: Create HistoryView.swift**

```swift
import SwiftUI

struct HistoryView: View {
    @StateObject private var historyViewModel = HistoryViewModel()
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Period Selector
                    periodSelector
                    
                    // Statistics Card
                    statisticsCard
                    
                    // History List
                    historyList
                }
                .padding()
            }
            .background(AppColors.background)
            .navigationTitle("服药历史")
            .refreshable {
                historyViewModel.loadHistory()
            }
        }
    }
    
    private var periodSelector: some View {
        Picker("时间段", selection: $historyViewModel.selectedPeriod) {
            ForEach(HistoryPeriod.allCases) { period in
                Text(period.rawValue).tag(period)
            }
        }
        .pickerStyle(.segmented)
        .onChange(of: historyViewModel.selectedPeriod) { _, _ in
            historyViewModel.loadHistory()
        }
    }
    
    private var statisticsCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading) {
                    Text("遵从率")
                        .font(.subheadline)
                        .foregroundColor(AppColors.secondaryText)
                    
                    Text("\(Int(historyViewModel.complianceRate))%")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(complianceColor)
                }
                
                Spacer()
                
                CircularProgressView(progress: historyViewModel.complianceRate / 100)
                    .frame(width: 80, height: 80)
            }
            
            Divider()
            
            HStack {
                statItem(value: "\(historyViewModel.totalDoses)", label: "总计划", color: AppColors.primary)
                Spacer()
                statItem(value: "\(historyViewModel.takenDoses)", label: "已服用", color: AppColors.success)
                Spacer()
                statItem(value: "\(historyViewModel.skippedDoses)", label: "跳过", color: AppColors.warning)
                Spacer()
                statItem(value: "\(historyViewModel.missedDoses)", label: "未服用", color: AppColors.danger)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
    }
    
    private func statItem(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(label)
                .font(.caption)
                .foregroundColor(AppColors.secondaryText)
        }
    }
    
    private var historyList: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("服药记录")
                .font(.headline)
                .foregroundColor(AppColors.primaryText)
            
            if historyViewModel.doseRecords.isEmpty {
                emptyHistoryView
            } else {
                ForEach(historyViewModel.recordsGroupedByDate(), id: \.0) { date, records in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(date.dateString)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(AppColors.secondaryText)
                        
                        ForEach(records) { record in
                            HistoryRecordRow(record: record)
                        }
                    }
                }
            }
        }
    }
    
    private var emptyHistoryView: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock")
                .font(.system(size: 50))
                .foregroundColor(AppColors.secondaryText.opacity(0.5))
            
            Text("暂无服药记录")
                .font(.headline)
                .foregroundColor(AppColors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
    
    private var complianceColor: Color {
        if historyViewModel.complianceRate >= 80 {
            return AppColors.success
        } else if historyViewModel.complianceRate >= 50 {
            return AppColors.warning
        } else {
            return AppColors.danger
        }
    }
}

struct CircularProgressView: View {
    let progress: Double
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: 8)
            
            Circle()
                .trim(from: 0, to: CGFloat(min(progress, 1.0)))
                .stroke(
                    progressColor,
                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.5), value: progress)
            
            Text("\(Int(progress * 100))%")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(progressColor)
        }
    }
    
    private var progressColor: Color {
        if progress >= 0.8 {
            return AppColors.success
        } else if progress >= 0.5 {
            return AppColors.warning
        } else {
            return AppColors.danger
        }
    }
}

struct HistoryRecordRow: View {
    let record: DoseRecord
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    
    private var medication: Medication? {
        medicationViewModel.medications.first { $0.id == record.medicationId }
    }
    
    var body: some View {
        HStack {
            statusIcon
            
            VStack(alignment: .leading, spacing: 2) {
                Text(medication?.name ?? "未知药物")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(record.scheduledTime.timeString)
                    .font(.caption)
                    .foregroundColor(AppColors.secondaryText)
            }
            
            Spacer()
            
            statusBadge
        }
        .padding()
        .background(Color.white)
        .cornerRadius(8)
    }
    
    private var statusIcon: some View {
        Image(systemName: statusIconName)
            .font(.title3)
            .foregroundColor(statusColor)
            .frame(width: 30)
    }
    
    private var statusIconName: String {
        switch record.status {
        case .taken: return "checkmark.circle.fill"
        case .skipped: return "forward.circle.fill"
        case .missed: return "xmark.circle.fill"
        case .pending: return "clock.fill"
        }
    }
    
    private var statusColor: Color {
        switch record.status {
        case .taken: return AppColors.success
        case .skipped: return AppColors.warning
        case .missed: return AppColors.danger
        case .pending: return AppColors.primary
        }
    }
    
    private var statusBadge: some View {
        Text(record.status.rawValue)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.1))
            .foregroundColor(statusColor)
            .cornerRadius(6)
    }
}

#Preview {
    HistoryView()
        .environmentObject(MedicationViewModel())
}
```

- [ ] **Step 8: Create SettingsView.swift**

```swift
import SwiftUI

struct SettingsView: View {
    @State private var notificationsEnabled = true
    @State private var showingExportSheet = false
    @State private var showingAbout = false
    
    private let notificationService = NotificationService.shared
    
    var body: some View {
        NavigationStack {
            List {
                Section(header: Text("通知设置")) {
                    Toggle(isOn: $notificationsEnabled) {
                        Label("用药提醒", systemImage: "bell.fill")
                    }
                    .onChange(of: notificationsEnabled) { _, newValue in
                        if newValue {
                            notificationService.requestAuthorization { _ in }
                        } else {
                            notificationService.cancelAllNotifications()
                        }
                    }
                    
                    NavigationLink {
                        NotificationSettingsView()
                    } label: {
                        Label("提醒声音", systemImage: "speaker.wave.2.fill")
                    }
                }
                
                Section(header: Text("数据")) {
                    Button(action: exportData) {
                        Label("导出服药记录", systemImage: "square.and.arrow.up")
                    }
                }
                
                Section(header: Text("关于")) {
                    NavigationLink {
                        AboutView()
                    } label: {
                        Label("关于药吃了么", systemImage: "info.circle")
                    }
                    
                    Link(destination: URL(string: "https://example.com/privacy")!) {
                        Label("隐私政策", systemImage: "hand.raised.fill")
                    }
                    
                    Link(destination: URL(string: "https://example.com/terms")!) {
                        Label("使用条款", systemImage: "doc.text")
                    }
                }
                
                Section {
                    HStack {
                        Spacer()
                        Text("版本 1.0.0")
                            .font(.caption)
                            .foregroundColor(AppColors.secondaryText)
                        Spacer()
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("设置")
        }
    }
    
    private func exportData() {
        showingExportSheet = true
    }
}

struct NotificationSettingsView: View {
    @State private var soundEnabled = true
    @State private var vibrationEnabled = true
    
    var body: some View {
        List {
            Section(header: Text("声音")) {
                Toggle("提醒声音", isOn: $soundEnabled)
            }
            
            Section(header: Text("震动")) {
                Toggle("震动提醒", isOn: $vibrationEnabled)
            }
        }
        .navigationTitle("提醒声音")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AboutView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Image(systemName: "pills.fill")
                    .font(.system(size: 80))
                    .foregroundColor(AppColors.primary)
                    .padding(.top, 40)
                
                Text("药吃了么")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("MagicSpins")
                    .font(.title3)
                    .foregroundColor(AppColors.secondaryText)
                
                VStack(alignment: .leading, spacing: 16) {
                    FeatureRow(icon: "bell.fill", title: "智能提醒", description: "准时提醒您服药，不再错过任何一次")
                    FeatureRow(icon: "chart.bar.fill", title: "数据追踪", description: "记录服药历史，追踪用药遵从率")
                    FeatureRow(icon: "heart.fill", title: "健康管理", description: "科学管理用药，维护身体健康")
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                
                Spacer()
                
                Text("© 2026 MagicSpins. 保留所有权利。")
                    .font(.caption)
                    .foregroundColor(AppColors.secondaryText)
                    .padding(.bottom, 20)
            }
        }
        .navigationTitle("关于")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(AppColors.primary)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(AppColors.secondaryText)
            }
        }
    }
}

#Preview {
    SettingsView()
}
```

---

## 3. Implementation Checklist

- [ ] Task 1: Initialize Xcode Project Structure
- [ ] Task 2: Implement Database Service
- [ ] Task 3: Implement Notification Service
- [ ] Task 4: Implement ViewModels
- [ ] Task 5: Implement UI Views

---

## 4. Build and Test Instructions

### Build Steps

1. Open Terminal and navigate to project directory:
```bash
cd /Users/george/Documents/workspace/ai-magic-spins/MagicSpins
```

2. Initialize Swift Package Manager if needed:
```bash
swift package init
```

3. Open project in Xcode:
```bash
open MagicSpins.xcodeproj
```

4. Select iPhone simulator and press ⌘+R to build and run

### Test Scenarios

1. **Add Medication Test**
   - Click "+" button
   - Fill in medication details
   - Save and verify it appears in list

2. **Notification Test**
   - Add medication with specific time
   - Wait for notification (or change system time)

3. **Mark as Taken Test**
   - Open home view
   - Click "已服用" on a medication card
   - Verify completion rate updates

4. **History Test**
   - Take several medications
   - View history tab
   - Verify statistics are correct

---

## 5. Estimated Time

**Total Implementation Time: 150 minutes (2.5 hours)**

- Task 1: 15 minutes
- Task 2: 25 minutes
- Task 3: 20 minutes
- Task 4: 25 minutes
- Task 5: 45 minutes
- Testing & Debugging: 20 minutes

---

**Plan saved:** `docs/superpowers/plans/2026-05-17-magic-spins-mvp-implementation.md`
