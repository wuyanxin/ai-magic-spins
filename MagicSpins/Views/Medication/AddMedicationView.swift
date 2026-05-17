import SwiftUI

struct AddMedicationView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    
    @State private var name = ""
    @State private var dosage = ""
    @State private var frequency: Frequency = .daily
    @State private var category: MedicationCategory = .morning
    @State private var notes = ""
    @State private var reminderTimes: [Date] = [Date()]
    
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var showScanner = false
    
    private let notificationService = NotificationService.shared
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Button {
                        showScanner = true
                    } label: {
                        HStack {
                            Image(systemName: "camera.viewfinder")
                                .foregroundColor(AppColors.primary)
                            Text("智能识别药品")
                                .foregroundColor(AppColors.primary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(AppColors.secondaryText)
                        }
                    }
                }
                
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
            .sheet(isPresented: $showScanner) {
                MedicationScannerView { result in
                    handleScanResult(result)
                }
            }
        }
    }
    
    private func handleScanResult(_ result: ScanResult) {
        if let medName = result.detectedMedicationName {
            name = medName
        }
        if let medDosage = result.detectedDosage {
            dosage = medDosage
        }
        
        if let freqText = result.detectedFrequency {
            if freqText.contains("两次") || freqText.contains("2次") {
                frequency = .twiceDaily
            } else if freqText.contains("三次") || freqText.contains("3次") {
                frequency = .threeTimesDaily
            } else if freqText.contains("四次") || freqText.contains("4次") {
                frequency = .fourTimesDaily
            } else if freqText.contains("必要") {
                frequency = .asNeeded
            } else {
                frequency = .daily
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
            notes: notes.isEmpty ? nil : notes,
            memberId: familyMemberViewModel.selectedMember?.id
        )
        
        medicationViewModel.addMedication(medication, memberId: familyMemberViewModel.selectedMember?.id)
        dismiss()
    }
}

