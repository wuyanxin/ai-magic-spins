import SwiftUI

struct FamilyStatsView: View {
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    @State private var selectedPeriod: HistoryPeriod = .week
    
    private let databaseService = DatabaseService.shared
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    overviewSection
                    
                    memberStatsSection
                }
                .padding()
            }
            .background(AppColors.background)
            .navigationTitle("家庭统计")
            .onAppear {
                selectedPeriod = .week
            }
        }
    }
    
    private var overviewSection: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("家庭总遵从率")
                        .font(.subheadline)
                        .foregroundColor(AppColors.secondaryText)
                    
                    Text("\(Int(averageComplianceRate))%")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(complianceColor)
                }
                
                Spacer()
                
                CircularProgressView(progress: averageComplianceRate / 100)
                    .frame(width: 100, height: 100)
            }
            
            Divider()
            
            HStack {
                statItem(
                    value: "\(familyMemberViewModel.familyMembers.count)",
                    label: "家庭成员",
                    color: AppColors.primary
                )
                
                Spacer()
                
                statItem(
                    value: "\(totalMedicationsCount)",
                    label: "药物总数",
                    color: AppColors.success
                )
                
                Spacer()
                
                statItem(
                    value: "\(totalDosesCount)",
                    label: "服药记录",
                    color: AppColors.warning
                )
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
    }
    
    private var memberStatsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("成员服药情况")
                .font(.headline)
                .foregroundColor(AppColors.primaryText)
            
            if familyMemberViewModel.familyMembers.isEmpty {
                emptyStateView
            } else {
                ForEach(familyMemberViewModel.familyMembers) { member in
                    memberStatCard(member)
                }
            }
        }
    }
    
    private func memberStatCard(_ member: FamilyMember) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color(hex: member.avatarColor))
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: member.relationship.icon)
                        .font(.system(size: 20))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(member.name)
                            .font(.headline)
                            .foregroundColor(AppColors.primaryText)
                        
                        if member.isDefault {
                            Text("默认")
                                .font(.caption2)
                                .fontWeight(.medium)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(AppColors.primary.opacity(0.1))
                                .foregroundColor(AppColors.primary)
                                .cornerRadius(4)
                        }
                    }
                    
                    Text(member.relationship.rawValue)
                        .font(.caption)
                        .foregroundColor(AppColors.secondaryText)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(Int(getMemberComplianceRate(member)))%")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(getMemberComplianceRate(member) >= 80 ? AppColors.success : (getMemberComplianceRate(member) >= 50 ? AppColors.warning : AppColors.danger))
                    
                    Text("遵从率")
                        .font(.caption)
                        .foregroundColor(AppColors.secondaryText)
                }
            }
            
            if familyMemberViewModel.getMemberCount() > 1 {
                HStack(spacing: 8) {
                    memberIndicator(
                        icon: "pills.fill",
                        count: getMemberMedicationCount(member),
                        label: "药物",
                        color: AppColors.primary
                    )
                    
                    memberIndicator(
                        icon: "checkmark.circle.fill",
                        count: getMemberTakenCount(member),
                        label: "已服",
                        color: AppColors.success
                    )
                    
                    memberIndicator(
                        icon: "forward.fill",
                        count: getMemberSkippedCount(member),
                        label: "跳过",
                        color: AppColors.warning
                    )
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
    }
    
    private func memberIndicator(icon: String, count: Int, label: String, color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(color)
            
            Text("\(count)")
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(AppColors.primaryText)
            
            Text(label)
                .font(.caption)
                .foregroundColor(AppColors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(color.opacity(0.1))
        .cornerRadius(8)
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
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "person.3")
                .font(.system(size: 60))
                .foregroundColor(AppColors.secondaryText.opacity(0.5))
            
            Text("暂无家庭成员数据")
                .font(.headline)
                .foregroundColor(AppColors.secondaryText)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
    
    private var averageComplianceRate: Double {
        let members = familyMemberViewModel.familyMembers
        guard !members.isEmpty else { return 0 }
        
        var totalRate: Double = 0
        for member in members {
            totalRate += getMemberComplianceRate(member)
        }
        
        return totalRate / Double(members.count)
    }
    
    private var complianceColor: Color {
        if averageComplianceRate >= 80 {
            return AppColors.success
        } else if averageComplianceRate >= 50 {
            return AppColors.warning
        } else {
            return AppColors.danger
        }
    }
    
    private var totalMedicationsCount: Int {
        var total = 0
        for member in familyMemberViewModel.familyMembers {
            let medications = databaseService.fetchMedications(for: member.id)
            total += medications.count
        }
        return total
    }
    
    private var totalDosesCount: Int {
        var total = 0
        let calendar = Calendar.current
        let now = Date()
        
        switch selectedPeriod {
        case .week:
            let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now))!
            for member in familyMemberViewModel.familyMembers {
                let records = databaseService.fetchDoseRecords(from: startOfWeek, to: now, memberId: member.id)
                total += records.count
            }
        case .month:
            let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
            for member in familyMemberViewModel.familyMembers {
                let records = databaseService.fetchDoseRecords(from: startOfMonth, to: now, memberId: member.id)
                total += records.count
            }
        case .all:
            for member in familyMemberViewModel.familyMembers {
                let records = databaseService.fetchDoseRecords(for: member.id)
                total += records.count
            }
        }
        
        return total
    }
    
    private func getMemberComplianceRate(_ member: FamilyMember) -> Double {
        let calendar = Calendar.current
        let now = Date()
        
        var startDate: Date
        switch selectedPeriod {
        case .week:
            startDate = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now))!
        case .month:
            startDate = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
        case .all:
            startDate = calendar.date(byAdding: .year, value: -1, to: now)!
        }
        
        let records = databaseService.fetchDoseRecords(from: startDate, to: now, memberId: member.id)
        guard !records.isEmpty else { return 0 }
        
        let completedCount = records.filter { $0.status == .taken || $0.status == .skipped }.count
        return Double(completedCount) / Double(records.count) * 100
    }
    
    private func getMemberMedicationCount(_ member: FamilyMember) -> Int {
        let medications = databaseService.fetchMedications(for: member.id)
        return medications.filter { $0.isActive }.count
    }
    
    private func getMemberTakenCount(_ member: FamilyMember) -> Int {
        let calendar = Calendar.current
        let now = Date()
        
        var startDate: Date
        switch selectedPeriod {
        case .week:
            startDate = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now))!
        case .month:
            startDate = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
        case .all:
            startDate = calendar.date(byAdding: .year, value: -1, to: now)!
        }
        
        let records = databaseService.fetchDoseRecords(from: startDate, to: now, memberId: member.id)
        return records.filter { $0.status == .taken }.count
    }
    
    private func getMemberSkippedCount(_ member: FamilyMember) -> Int {
        let calendar = Calendar.current
        let now = Date()
        
        var startDate: Date
        switch selectedPeriod {
        case .week:
            startDate = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: now))!
        case .month:
            startDate = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
        case .all:
            startDate = calendar.date(byAdding: .year, value: -1, to: now)!
        }
        
        let records = databaseService.fetchDoseRecords(from: startDate, to: now, memberId: member.id)
        return records.filter { $0.status == .skipped }.count
    }
}
