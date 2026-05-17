import Foundation
import SQLite

class FamilyMemberService {
    static let shared = FamilyMemberService()
    
    private var db: Connection?
    
    private let familyMembers = Table("family_members")
    
    private let memberId = Expression<String>("id")
    private let memberName = Expression<String>("name")
    private let memberRelationship = Expression<String>("relationship")
    private let memberAvatarColor = Expression<String>("avatarColor")
    private let memberIsDefault = Expression<Bool>("isDefault")
    private let memberCreatedAt = Expression<String>("createdAt")
    private let memberUpdatedAt = Expression<String>("updatedAt")
    
    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
    private init() {
        setupDatabase()
    }
    
    private func setupDatabase() {
        do {
            let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
            db = try Connection("\(path)/magicSpins.sqlite3")
            try createTables()
        } catch {
            print("FamilyMemberService - Database setup failed: \(error)")
        }
    }
    
    private func createTables() throws {
        try db?.run(familyMembers.create(ifNotExists: true) { t in
            t.column(memberId, primaryKey: true)
            t.column(memberName)
            t.column(memberRelationship)
            t.column(memberAvatarColor)
            t.column(memberIsDefault)
            t.column(memberCreatedAt)
            t.column(memberUpdatedAt)
        })
    }
    
    func addFamilyMember(_ member: FamilyMember) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        var newMember = member
        if isFirstMember() {
            newMember.isDefault = true
        }
        
        try db.run(familyMembers.insert(
            memberId <- newMember.id.uuidString,
            memberName <- newMember.name,
            memberRelationship <- newMember.relationship.rawValue,
            memberAvatarColor <- newMember.avatarColor,
            memberIsDefault <- newMember.isDefault,
            memberCreatedAt <- dateFormatter.string(from: newMember.createdAt),
            memberUpdatedAt <- dateFormatter.string(from: newMember.updatedAt)
        ))
    }
    
    func updateFamilyMember(_ member: FamilyMember) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = familyMembers.filter(memberId == member.id.uuidString)
        try db.run(query.update(
            memberName <- member.name,
            memberRelationship <- member.relationship.rawValue,
            memberAvatarColor <- member.avatarColor,
            memberIsDefault <- member.isDefault,
            memberUpdatedAt <- dateFormatter.string(from: Date())
        ))
    }
    
    func deleteFamilyMember(id: UUID) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = familyMembers.filter(memberId == id.uuidString)
        try db.run(query.delete())
        
        try MedicationDatabaseService.shared.deleteMedications(for: id)
        try DoseRecordService.shared.deleteDoseRecords(for: id)
        
        if try isDefaultMember(id: id) {
            try setFirstMemberAsDefault()
        }
    }
    
    func fetchAllFamilyMembers() throws -> [FamilyMember] {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        var result: [FamilyMember] = []
        
        for row in try db.prepare(familyMembers.order(memberCreatedAt.asc)) {
            let member = FamilyMember(
                id: UUID(uuidString: row[memberId])!,
                name: row[memberName],
                relationship: MemberRelationship(rawValue: row[memberRelationship]) ?? .other,
                avatarColor: row[memberAvatarColor],
                isDefault: row[memberIsDefault],
                createdAt: dateFormatter.date(from: row[memberCreatedAt]) ?? Date(),
                updatedAt: dateFormatter.date(from: row[memberUpdatedAt]) ?? Date()
            )
            result.append(member)
        }
        
        return result
    }
    
    func fetchFamilyMember(id: UUID) throws -> FamilyMember? {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = familyMembers.filter(memberId == id.uuidString)
        
        for row in try db.prepare(query) {
            return FamilyMember(
                id: UUID(uuidString: row[memberId])!,
                name: row[memberName],
                relationship: MemberRelationship(rawValue: row[memberRelationship]) ?? .other,
                avatarColor: row[memberAvatarColor],
                isDefault: row[memberIsDefault],
                createdAt: dateFormatter.date(from: row[memberCreatedAt]) ?? Date(),
                updatedAt: dateFormatter.date(from: row[memberUpdatedAt]) ?? Date()
            )
        }
        
        return nil
    }
    
    func fetchDefaultFamilyMember() throws -> FamilyMember? {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = familyMembers.filter(memberIsDefault == true)
        
        for row in try db.prepare(query) {
            return FamilyMember(
                id: UUID(uuidString: row[memberId])!,
                name: row[memberName],
                relationship: MemberRelationship(rawValue: row[memberRelationship]) ?? .other,
                avatarColor: row[memberAvatarColor],
                isDefault: row[memberIsDefault],
                createdAt: dateFormatter.date(from: row[memberCreatedAt]) ?? Date(),
                updatedAt: dateFormatter.date(from: row[memberUpdatedAt]) ?? Date()
            )
        }
        
        return nil
    }
    
    func setDefaultMember(id: UUID) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        try db.run(familyMembers.update(memberIsDefault <- false))
        
        let query = familyMembers.filter(memberId == id.uuidString)
        try db.run(query.update(memberIsDefault <- true))
    }
    
    private func isFirstMember() -> Bool {
        guard let db = db else { return true }
        
        do {
            let count = try db.scalar(familyMembers.count)
            return count == 0
        } catch {
            return true
        }
    }
    
    private func isDefaultMember(id: UUID) throws -> Bool {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = familyMembers.filter(memberId == id.uuidString && memberIsDefault == true)
        let count = try db.scalar(query.count)
        return count > 0
    }
    
    private func setFirstMemberAsDefault() throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let firstMemberQuery = familyMembers.limit(1)
        
        for row in try db.prepare(firstMemberQuery) {
            let query = familyMembers.filter(memberId == row[memberId])
            try db.run(query.update(memberIsDefault <- true))
            break
        }
    }
}

class MedicationDatabaseService {
    static let shared = MedicationDatabaseService()
    
    private var db: Connection?
    
    private let medications = Table("medications")
    private let medId = Expression<String>("id")
    private let medMemberId = Expression<String>("memberId")
    
    private init() {
        setupDatabase()
    }
    
    private func setupDatabase() {
        do {
            let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
            db = try Connection("\(path)/magicSpins.sqlite3")
        } catch {
            print("MedicationDatabaseService - Database setup failed: \(error)")
        }
    }
    
    func addMemberIdColumn() throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        do {
            try db.run(medications.addColumn(medMemberId, defaultValue: "default"))
        } catch {
            print("Column might already exist: \(error)")
        }
    }
    
    func updateMedicationMemberId(medicationId: UUID, memberId: UUID) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = medications.filter(medId == medicationId.uuidString)
        try db.run(query.update(medMemberId <- memberId.uuidString))
    }
    
    func deleteMedications(for memberId: UUID) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = medications.filter(medMemberId == memberId.uuidString)
        try db.run(query.delete())
    }
}

class DoseRecordService {
    static let shared = DoseRecordService()
    
    private var db: Connection?
    
    private let doseRecords = Table("dose_records")
    private let doseId = Expression<String>("id")
    private let doseMemberId = Expression<String>("memberId")
    
    private init() {
        setupDatabase()
    }
    
    private func setupDatabase() {
        do {
            let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
            db = try Connection("\(path)/magicSpins.sqlite3")
        } catch {
            print("DoseRecordService - Database setup failed: \(error)")
        }
    }
    
    func addMemberIdColumn() throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        do {
            try db.run(doseRecords.addColumn(doseMemberId, defaultValue: "default"))
        } catch {
            print("Column might already exist: \(error)")
        }
    }
    
    func deleteDoseRecords(for memberId: UUID) throws {
        guard let db = db else { throw DatabaseError.connectionFailed }
        
        let query = doseRecords.filter(doseMemberId == memberId.uuidString)
        try db.run(query.delete())
    }
}
