import Foundation
import Combine

class FamilyMemberViewModel: ObservableObject {
    @Published var familyMembers: [FamilyMember] = []
    @Published var selectedMember: FamilyMember?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let familyMemberService = FamilyMemberService.shared
    
    init() {
        loadFamilyMembers()
    }
    
    func loadFamilyMembers() {
        isLoading = true
        do {
            familyMembers = try familyMemberService.fetchAllFamilyMembers()
            
            if familyMembers.isEmpty {
                let defaultMember = FamilyMember(
                    name: "我",
                    relationship: .myself,
                    avatarColor: MemberRelationship.myself.defaultColor,
                    isDefault: true
                )
                try familyMemberService.addFamilyMember(defaultMember)
                familyMembers = [defaultMember]
                selectedMember = defaultMember
            } else {
                selectedMember = try familyMemberService.fetchDefaultFamilyMember()
            }
            
            isLoading = false
        } catch {
            errorMessage = "加载家庭成员失败: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    func addFamilyMember(_ member: FamilyMember) {
        do {
            try familyMemberService.addFamilyMember(member)
            loadFamilyMembers()
        } catch {
            errorMessage = "添加家庭成员失败: \(error.localizedDescription)"
        }
    }
    
    func updateFamilyMember(_ member: FamilyMember) {
        do {
            try familyMemberService.updateFamilyMember(member)
            loadFamilyMembers()
        } catch {
            errorMessage = "更新家庭成员失败: \(error.localizedDescription)"
        }
    }
    
    func deleteFamilyMember(_ member: FamilyMember) {
        do {
            try familyMemberService.deleteFamilyMember(id: member.id)
            loadFamilyMembers()
        } catch {
            errorMessage = "删除家庭成员失败: \(error.localizedDescription)"
        }
    }
    
    func selectMember(_ member: FamilyMember) {
        selectedMember = member
    }
    
    func setDefaultMember(_ member: FamilyMember) {
        do {
            try familyMemberService.setDefaultMember(id: member.id)
            loadFamilyMembers()
        } catch {
            errorMessage = "设置默认成员失败: \(error.localizedDescription)"
        }
    }
    
    func getMemberCount() -> Int {
        return familyMembers.count
    }
    
    func isCurrentMember(_ member: FamilyMember) -> Bool {
        return selectedMember?.id == member.id
    }
}
