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
