import SwiftUI

struct FamilyMemberSelector: View {
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    @State private var showMemberManagement = false
    @State private var showMemberPicker = false
    
    var body: some View {
        HStack(spacing: 12) {
            Button(action: { showMemberPicker = true }) {
                HStack(spacing: 8) {
                    memberAvatar
                    
                    Text(selectedMemberName)
                        .font(.headline)
                        .foregroundColor(AppColors.primaryText)
                    
                    Image(systemName: "chevron.down")
                        .font(.caption)
                        .foregroundColor(AppColors.secondaryText)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.white)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
            }
            
            Spacer()
            
            if familyMemberViewModel.getMemberCount() > 1 {
                Button(action: { showMemberManagement = true }) {
                    Image(systemName: "person.2.fill")
                        .font(.title3)
                        .foregroundColor(AppColors.primary)
                        .padding(8)
                        .background(Color.white)
                        .cornerRadius(20)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                }
            }
            
            Button(action: { showMemberManagement = true }) {
                Image(systemName: "plus.circle.fill")
                    .font(.title3)
                    .foregroundColor(AppColors.primary)
                    .padding(8)
                    .background(Color.white)
                    .cornerRadius(20)
                    .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
            }
        }
        .padding(.horizontal)
        .sheet(isPresented: $showMemberManagement) {
            FamilyManagementView()
        }
        .sheet(isPresented: $showMemberPicker) {
            MemberPickerSheet()
        }
    }
    
    private var selectedMemberName: String {
        familyMemberViewModel.selectedMember?.name ?? "选择成员"
    }
    
    private var memberAvatar: some View {
        let avatarColor = familyMemberViewModel.selectedMember?.avatarColor ?? "007AFF"
        
        return ZStack {
            Circle()
                .fill(Color(hex: avatarColor))
                .frame(width: 32, height: 32)
            
            Text(avatarInitials)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
        }
    }
    
    private var avatarInitials: String {
        guard let name = familyMemberViewModel.selectedMember?.name else {
            return "?"
        }
        
        let names = name.split(separator: " ")
        if names.count >= 2 {
            return String(names[0].prefix(1) + names[1].prefix(1))
        } else if let firstName = names.first, firstName.count >= 2 {
            return String(firstName.prefix(2))
        } else if let firstName = names.first {
            return String(firstName.prefix(1))
        }
        
        return "?"
    }
}

struct MemberPickerSheet: View {
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(familyMemberViewModel.familyMembers) { member in
                    Button(action: {
                        familyMemberViewModel.selectMember(member)
                        dismiss()
                    }) {
                        HStack(spacing: 12) {
                            memberAvatar(for: member)
                            
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
                                    .font(.subheadline)
                                    .foregroundColor(AppColors.secondaryText)
                            }
                            
                            Spacer()
                            
                            if familyMemberViewModel.isCurrentMember(member) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.title3)
                                    .foregroundColor(AppColors.success)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
            .navigationTitle("选择成员")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完成") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
    
    private func memberAvatar(for member: FamilyMember) -> some View {
        ZStack {
            Circle()
                .fill(Color(hex: member.avatarColor))
                .frame(width: 44, height: 44)
            
            Image(systemName: member.relationship.icon)
                .font(.system(size: 20))
                .foregroundColor(.white)
        }
    }
}

#Preview {
    FamilyMemberSelector()
        .environmentObject(FamilyMemberViewModel())
}
