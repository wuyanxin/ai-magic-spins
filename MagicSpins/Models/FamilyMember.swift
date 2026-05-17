import Foundation

struct FamilyMember: Identifiable, Codable, Equatable {
    var id: UUID
    var name: String
    var relationship: MemberRelationship
    var avatarColor: String
    var isDefault: Bool
    var createdAt: Date
    var updatedAt: Date
    
    init(id: UUID = UUID(),
         name: String,
         relationship: MemberRelationship,
         avatarColor: String = "007AFF",
         isDefault: Bool = false,
         createdAt: Date = Date(),
         updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.relationship = relationship
        self.avatarColor = avatarColor
        self.isDefault = isDefault
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

enum MemberRelationship: String, CaseIterable, Identifiable, Codable {
    case myself = "本人"
    case spouse = "配偶"
    case child = "子女"
    case parent = "父母"
    case grandparent = "祖父母"
    case sibling = "兄弟姐妹"
    case other = "其他"
    
    var id: String { rawValue }
    
    var icon: String {
        switch self {
        case .myself: return "person.fill"
        case .spouse: return "heart.fill"
        case .child: return "figure.child"
        case .parent: return "figure.stand"
        case .grandparent: return "figure.stand.line.dotted.figure.stand"
        case .sibling: return "person.2.fill"
        case .other: return "person.crop.circle"
        }
    }
    
    var defaultColor: String {
        switch self {
        case .myself: return "007AFF"
        case .spouse: return "FF2D55"
        case .child: return "34C759"
        case .parent: return "FF9500"
        case .grandparent: return "AF52DE"
        case .sibling: return "5856D6"
        case .other: return "8E8E93"
        }
    }
}
