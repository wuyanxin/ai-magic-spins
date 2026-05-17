import SwiftUI

struct FamilyManagementView: View {
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showAddMember = false
    @State private var memberToEdit: FamilyMember?
    @State private var showDeleteAlert = false
    @State private var memberToDelete: FamilyMember?
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(familyMemberViewModel.familyMembers) { member in
                        memberRow(member)
                    }
                } header: {
                    Text("家庭成员")
                } footer: {
                    Text("点击成员卡片查看详情或编辑信息")
                }
                
                Section {
                    Button(action: { showAddMember = true }) {
                        Label("添加家庭成员", systemImage: "plus.circle.fill")
                            .foregroundColor(AppColors.primary)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("家庭成员管理")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完成") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showAddMember) {
                AddFamilyMemberView()
            }
            .sheet(item: $memberToEdit) { member in
                EditFamilyMemberView(member: member)
            }
            .alert("确认删除", isPresented: $showDeleteAlert) {
                Button("取消", role: .cancel) { }
                Button("删除", role: .destructive) {
                    if let member = memberToDelete {
                        familyMemberViewModel.deleteFamilyMember(member)
                    }
                }
            } message: {
                if let member = memberToDelete {
                    Text("确定要删除 \(member.name) 吗？该成员的所有药物和服药记录也将被删除。")
                }
            }
        }
    }
    
    private func memberRow(_ member: FamilyMember) -> some View {
        Button(action: { memberToEdit = member }) {
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(Color(hex: member.avatarColor))
                        .frame(width: 50, height: 50)
                    
                    Image(systemName: member.relationship.icon)
                        .font(.system(size: 22))
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
                                .background(AppColors.success.opacity(0.1))
                                .foregroundColor(AppColors.success)
                                .cornerRadius(4)
                        }
                    }
                    
                    Text(member.relationship.rawValue)
                        .font(.subheadline)
                        .foregroundColor(AppColors.secondaryText)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(AppColors.secondaryText)
            }
            .padding(.vertical, 4)
            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                if !member.isDefault {
                    Button(role: .destructive) {
                        memberToDelete = member
                        showDeleteAlert = true
                    } label: {
                        Label("删除", systemImage: "trash")
                    }
                }
                
                if !member.isDefault {
                    Button {
                        familyMemberViewModel.setDefaultMember(member)
                    } label: {
                        Label("设为默认", systemImage: "star")
                    }
                    .tint(AppColors.warning)
                }
            }
        }
    }
}

struct AddFamilyMemberView: View {
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var name = ""
    @State private var relationship: MemberRelationship = .spouse
    @State private var selectedColor = MemberRelationship.spouse.defaultColor
    @State private var showError = false
    @State private var errorMessage = ""
    
    private let colorOptions = ["007AFF", "FF2D55", "34C759", "FF9500", "AF52DE", "5856D6", "8E8E93"]
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("基本信息")) {
                    TextField("成员姓名", text: $name)
                        .autocapitalization(.words)
                }
                
                Section(header: Text("关系")) {
                    Picker("与您的关系", selection: $relationship) {
                        ForEach(MemberRelationship.allCases) { rel in
                            HStack {
                                Image(systemName: rel.icon)
                                Text(rel.rawValue)
                            }
                            .tag(rel)
                        }
                    }
                    .pickerStyle(.navigationLink)
                    .onChange(of: relationship) { _, newValue in
                        selectedColor = newValue.defaultColor
                    }
                }
                
                Section(header: Text("头像颜色")) {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 44))], spacing: 12) {
                        ForEach(colorOptions, id: \.self) { color in
                            Button(action: { selectedColor = color }) {
                                ZStack {
                                    Circle()
                                        .fill(Color(hex: color))
                                        .frame(width: 44, height: 44)
                                    
                                    if selectedColor == color {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 16, weight: .bold))
                                            .foregroundColor(.white)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                Section {
                    previewCard
                } header: {
                    Text("预览")
                }
            }
            .navigationTitle("添加成员")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        saveMember()
                    }
                    .disabled(!isFormValid)
                }
            }
            .alert("错误", isPresented: $showError) {
                Button("确定", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private var previewCard: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color(hex: selectedColor))
                    .frame(width: 60, height: 60)
                
                Image(systemName: relationship.icon)
                    .font(.system(size: 26))
                    .foregroundColor(.white)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(name.isEmpty ? "成员姓名" : name)
                    .font(.headline)
                    .foregroundColor(name.isEmpty ? AppColors.secondaryText : AppColors.primaryText)
                
                Text(relationship.rawValue)
                    .font(.subheadline)
                    .foregroundColor(AppColors.secondaryText)
            }
            
            Spacer()
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }
    
    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    private func saveMember() {
        guard isFormValid else {
            errorMessage = "请输入成员姓名"
            showError = true
            return
        }
        
        let member = FamilyMember(
            name: name.trimmingCharacters(in: .whitespaces),
            relationship: relationship,
            avatarColor: selectedColor,
            isDefault: false
        )
        
        familyMemberViewModel.addFamilyMember(member)
        dismiss()
    }
}

struct EditFamilyMemberView: View {
    let member: FamilyMember
    @EnvironmentObject var familyMemberViewModel: FamilyMemberViewModel
    @Environment(\.dismiss) private var dismiss
    
    @State private var name: String
    @State private var relationship: MemberRelationship
    @State private var selectedColor: String
    @State private var showDeleteAlert = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    private let colorOptions = ["007AFF", "FF2D55", "34C759", "FF9500", "AF52DE", "5856D6", "8E8E93"]
    
    init(member: FamilyMember) {
        self.member = member
        _name = State(initialValue: member.name)
        _relationship = State(initialValue: member.relationship)
        _selectedColor = State(initialValue: member.avatarColor)
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("基本信息")) {
                    TextField("成员姓名", text: $name)
                        .autocapitalization(.words)
                }
                
                Section(header: Text("关系")) {
                    Picker("与您的关系", selection: $relationship) {
                        ForEach(MemberRelationship.allCases) { rel in
                            HStack {
                                Image(systemName: rel.icon)
                                Text(rel.rawValue)
                            }
                            .tag(rel)
                        }
                    }
                    .pickerStyle(.navigationLink)
                    .onChange(of: relationship) { _, newValue in
                        if member.relationship == .myself && newValue != .myself {
                            selectedColor = newValue.defaultColor
                        }
                    }
                }
                
                Section(header: Text("头像颜色")) {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 44))], spacing: 12) {
                        ForEach(colorOptions, id: \.self) { color in
                            Button(action: { selectedColor = color }) {
                                ZStack {
                                    Circle()
                                        .fill(Color(hex: color))
                                        .frame(width: 44, height: 44)
                                    
                                    if selectedColor == color {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 16, weight: .bold))
                                            .foregroundColor(.white)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                Section {
                    previewCard
                } header: {
                    Text("预览")
                }
                
                if !member.isDefault {
                    Section {
                        Button(action: { familyMemberViewModel.setDefaultMember(member) }) {
                            Label("设为默认成员", systemImage: "star.fill")
                                .foregroundColor(AppColors.warning)
                        }
                        
                        Button(role: .destructive, action: { showDeleteAlert = true }) {
                            Label("删除成员", systemImage: "trash")
                        }
                    }
                } else {
                    Section {
                        HStack {
                            Image(systemName: "info.circle")
                                .foregroundColor(AppColors.primary)
                            Text("这是您的默认成员，无法删除")
                                .font(.subheadline)
                                .foregroundColor(AppColors.secondaryText)
                        }
                    } header: {
                        Text("提示")
                    }
                }
            }
            .navigationTitle("编辑成员")
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
                    .disabled(!isFormValid)
                }
            }
            .alert("确认删除", isPresented: $showDeleteAlert) {
                Button("取消", role: .cancel) { }
                Button("删除", role: .destructive) {
                    familyMemberViewModel.deleteFamilyMember(member)
                    dismiss()
                }
            } message: {
                Text("确定要删除 \(member.name) 吗？该成员的所有药物和服药记录也将被删除。")
            }
            .alert("错误", isPresented: $showError) {
                Button("确定", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private var previewCard: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color(hex: selectedColor))
                    .frame(width: 60, height: 60)
                
                Image(systemName: relationship.icon)
                    .font(.system(size: 26))
                    .foregroundColor(.white)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(name.isEmpty ? "成员姓名" : name)
                    .font(.headline)
                    .foregroundColor(name.isEmpty ? AppColors.secondaryText : AppColors.primaryText)
                
                Text(relationship.rawValue)
                    .font(.subheadline)
                    .foregroundColor(AppColors.secondaryText)
            }
            
            Spacer()
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }
    
    private var isFormValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    private func saveChanges() {
        guard isFormValid else {
            errorMessage = "请输入成员姓名"
            showError = true
            return
        }
        
        var updatedMember = member
        updatedMember.name = name.trimmingCharacters(in: .whitespaces)
        updatedMember.relationship = relationship
        updatedMember.avatarColor = selectedColor
        updatedMember.updatedAt = Date()
        
        familyMemberViewModel.updateFamilyMember(updatedMember)
        dismiss()
    }
}

#Preview {
    FamilyManagementView()
        .environmentObject(FamilyMemberViewModel())
}
