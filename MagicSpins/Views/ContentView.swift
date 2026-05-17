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
