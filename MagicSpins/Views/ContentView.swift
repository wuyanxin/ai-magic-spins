import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            Text("首页")
                .tabItem {
                    Label("首页", systemImage: "house.fill")
                }
                .tag(0)
            
            Text("药物")
                .tabItem {
                    Label("药物", systemImage: "pills.fill")
                }
                .tag(1)
            
            Text("历史")
                .tabItem {
                    Label("历史", systemImage: "clock.fill")
                }
                .tag(2)
            
            Text("设置")
                .tabItem {
                    Label("设置", systemImage: "gearshape.fill")
                }
                .tag(3)
        }
    }
}

#Preview {
    ContentView()
}
