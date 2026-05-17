import SwiftUI

struct HomeView: View {
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    @EnvironmentObject var reminderViewModel: ReminderViewModel
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    headerSection
                    
                    // Today's Progress
                    progressSection
                    
                    // Today's Medications
                    medicationListSection
                }
                .padding()
            }
            .background(AppColors.background)
            .navigationTitle("今日用药")
            .refreshable {
                medicationViewModel.loadMedications()
                reminderViewModel.loadTodayRecords()
            }
        }
    }
    
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(Date(), style: .date)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(AppColors.primaryText)
            
            Text("记得按时服药哦！💊")
                .font(.subheadline)
                .foregroundColor(AppColors.secondaryText)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    private var progressSection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("今日遵从率")
                    .font(.headline)
                    .foregroundColor(AppColors.primaryText)
                
                Spacer()
                
                Text("\(Int(reminderViewModel.getCompletionRate()))%")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(completionRateColor)
            }
            
            ProgressView(value: reminderViewModel.getCompletionRate(), total: 100)
                .tint(completionRateColor)
                .scaleEffect(x: 1, y: 2, anchor: .center)
            
            HStack {
                Label("\(reminderViewModel.completedDoses.count)", systemImage: "checkmark.circle.fill")
                    .foregroundColor(AppColors.success)
                
                Spacer()
                
                Label("\(reminderViewModel.skippedDoses.count)", systemImage: "forward.fill")
                    .foregroundColor(AppColors.warning)
                
                Spacer()
                
                Label("\(reminderViewModel.pendingDoses.count)", systemImage: "clock.fill")
                    .foregroundColor(AppColors.primary)
            }
            .font(.caption)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
    }
    
    private var medicationListSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("今日计划")
                .font(.headline)
                .foregroundColor(AppColors.primaryText)
            
            if medicationViewModel.todayMedications.isEmpty {
                emptyStateView
            } else {
                ForEach(medicationViewModel.todayMedications) { medication in
                    MedicationCard(medication: medication)
                }
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "pills")
                .font(.system(size: 60))
                .foregroundColor(AppColors.secondaryText.opacity(0.5))
            
            Text("还没有添加药物")
                .font(.headline)
                .foregroundColor(AppColors.secondaryText)
            
            Text("点击下方「药物」标签添加您的第一个药物")
                .font(.subheadline)
                .foregroundColor(AppColors.secondaryText)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }
    
    private var completionRateColor: Color {
        let rate = reminderViewModel.getCompletionRate()
        if rate >= 80 {
            return AppColors.success
        } else if rate >= 50 {
            return AppColors.warning
        } else {
            return AppColors.danger
        }
    }
}

