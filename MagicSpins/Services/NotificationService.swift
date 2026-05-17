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
