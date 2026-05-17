import SwiftUI

struct MedicationListView: View {
    @EnvironmentObject var medicationViewModel: MedicationViewModel
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    @State private var showingAddMedication = false
    @State private var searchText = ""
    
    var body: some View {
        NavigationStack {
            List {
                if medicationViewModel.medications.isEmpty {
                    emptyStateView
                } else {
                    ForEach(groupedMedications.keys.sorted(by: { $0.rawValue < $1.rawValue }), id: \.self) { category in
                        Section(header: Text(category.rawValue)) {
                            ForEach(groupedMedications[category] ?? []) { medication in
                                NavigationLink(destination: MedicationDetailView(medication: medication)) {
                                    MedicationRowView(medication: medication)
                                }
                            }
                            .onDelete { indexSet in
                                deleteMedications(at: indexSet, in: category)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .searchable(text: $searchText, prompt: "搜索药物")
            .navigationTitle("药物管理")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddMedication = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }
            }
            .sheet(isPresented: $showingAddMedication) {
                AddMedicationView()
            }
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
        medicationViewModel.loadMedications(memberId: familyMemberViewModel.selectedMember?.id)
    }
    
    private var groupedMedications: [MedicationCategory: [Medication]] {
        let filtered = searchText.isEmpty ? medicationViewModel.medications :
            medicationViewModel.medications.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        return Dictionary(grouping: filtered, by: { $0.category })
    }
    
    private var emptyStateView: some View {
        ContentUnavailableView {
            Label("暂无药物", systemImage: "pills")
        } description: {
            Text("点击右上角「+」添加您的第一个药物")
        } actions: {
            Button("添加药物") {
                showingAddMedication = true
            }
            .buttonStyle(.borderedProminent)
        }
    }
    
    private func deleteMedications(at offsets: IndexSet, in category: MedicationCategory) {
        guard let medications = groupedMedications[category] else { return }
        for index in offsets {
            let medication = medications[index]
            medicationViewModel.deleteMedication(medication)
        }
    }
}

struct MedicationRowView: View {
    let medication: Medication
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(medication.name)
                    .font(.headline)
                
                Spacer()
                
                if medication.isActive {
                    Circle()
                        .fill(AppColors.success)
                        .frame(width: 8, height: 8)
                } else {
                    Circle()
                        .fill(AppColors.secondaryText)
                        .frame(width: 8, height: 8)
                }
            }
            
            Text(medication.dosage)
                .font(.subheadline)
                .foregroundColor(AppColors.secondaryText)
            
            HStack {
                Text(medication.frequency.rawValue)
                    .font(.caption)
                    .foregroundColor(AppColors.secondaryText)
                
                Spacer()
                
                if let nextTime = medication.reminderTimes.first {
                    Text("下次: \(nextTime.timeString)")
                        .font(.caption)
                        .foregroundColor(AppColors.primary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

