import SwiftUI

struct HistoryView: View {
    @StateObject private var historyViewModel = HistoryViewModel()
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    periodSelector
                    
                    statisticsCard
                    
                    historyList
                }
                .padding()
            }
            .background(AppColors.background)
            .navigationTitle("服药历史")
            .onAppear {
                loadDataForCurrentMember()
            }
            .onChange(of: familyMemberViewModel.selectedMember?.id) { _, _ in
                loadDataForCurrentMember()
            }
            .refreshable {
                loadDataForCurrentMember()
            }
        }
    }
    
    private func loadDataForCurrentMember() {
        historyViewModel.loadHistory(memberId: familyMemberViewModel.selectedMember?.id)
    }
    
    private var periodSelector: some View {
        Picker("时间段", selection: $historyViewModel.selectedPeriod) {
            ForEach(HistoryPeriod.allCases) { period in
                Text(period.rawValue).tag(period)
            }
        }
        .pickerStyle(.segmented)
        .onChange(of: historyViewModel.selectedPeriod) { _, _ in
            loadDataForCurrentMember()
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

