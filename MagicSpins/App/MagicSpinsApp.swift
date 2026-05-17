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
