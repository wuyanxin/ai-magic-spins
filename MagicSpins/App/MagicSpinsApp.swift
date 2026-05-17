import SwiftUI

@main
struct MagicSpinsApp: App {
    @StateObject private var medicationViewModel = MedicationViewModel()
    @StateObject private var reminderViewModel = ReminderViewModel()
    @StateObject private var familyMemberViewModel = FamilyMemberViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(medicationViewModel)
                .environmentObject(reminderViewModel)
                .environmentObject(familyMemberViewModel)
        }
    }
}
