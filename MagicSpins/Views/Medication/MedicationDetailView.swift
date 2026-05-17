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
