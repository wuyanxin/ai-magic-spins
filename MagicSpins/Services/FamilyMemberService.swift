import Foundation

class FamilyMemberService {
    static let shared = FamilyMemberService()
    private let userDefaults = UserDefaults.standard
    private let familyMembersKey = "familyMembers"
    
    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
    private init() {}
    
    func addFamilyMember(_ member: FamilyMember) throws {
        var members = try fetchAllFamilyMembers()
        
        var newMember = member
        if members.isEmpty {
            newMember.isDefault = true
        }
        
        members.append(newMember)
        saveFamilyMembers(members)
    }
    
    func updateFamilyMember(_ member: FamilyMember) throws {
        var members = try fetchAllFamilyMembers()
        
        if let index = members.firstIndex(where: { $0.id == member.id }) {
            var updatedMember = member
            updatedMember.updatedAt = Date()
            members[index] = updatedMember
            saveFamilyMembers(members)
        }
    }
    
    func deleteFamilyMember(id: UUID) throws {
        var members = try fetchAllFamilyMembers()
        members.removeAll { $0.id == id }
        saveFamilyMembers(members)
        
        DatabaseService.shared.deleteMedicationsByMember(memberId: id)
        DatabaseService.shared.deleteDoseRecordsByMember(memberId: id)
        
        if members.isEmpty {
            return
        }
        
        if !members.contains(where: { $0.isDefault }) {
            members[0].isDefault = true
            saveFamilyMembers(members)
        }
    }
    
    func fetchAllFamilyMembers() throws -> [FamilyMember] {
        guard let data = userDefaults.data(forKey: familyMembersKey) else {
            return []
        }
        do {
            let members = try JSONDecoder().decode([FamilyMember].self, from: data)
            return members.sorted { $0.createdAt < $1.createdAt }
        } catch {
            print("Failed to decode family members: \(error)")
            return []
        }
    }
    
    func fetchFamilyMember(id: UUID) throws -> FamilyMember? {
        let members = try fetchAllFamilyMembers()
        return members.first { $0.id == id }
    }
    
    func fetchDefaultFamilyMember() throws -> FamilyMember? {
        let members = try fetchAllFamilyMembers()
        return members.first { $0.isDefault }
    }
    
    func setDefaultMember(id: UUID) throws {
        var members = try fetchAllFamilyMembers()
        
        for i in members.indices {
            members[i].isDefault = (members[i].id == id)
        }
        
        saveFamilyMembers(members)
    }
    
    private func saveFamilyMembers(_ members: [FamilyMember]) {
        do {
            let data = try JSONEncoder().encode(members)
            userDefaults.set(data, forKey: familyMembersKey)
        } catch {
            print("Failed to save family members: \(error)")
        }
    }
}
