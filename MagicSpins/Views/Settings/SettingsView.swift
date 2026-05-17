import SwiftUI

struct SettingsView: View {
    @State private var notificationsEnabled = true
    @State private var showingExportSheet = false
    
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

