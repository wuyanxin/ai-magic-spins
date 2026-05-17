import Foundation

enum Frequency: String, CaseIterable, Identifiable, Codable {
    case daily = "每日一次"
    case twiceDaily = "每日两次"
    case threeTimesDaily = "每日三次"
    case fourTimesDaily = "每日四次"
    case asNeeded = "必要时"
    
    var id: String { rawValue }
}

enum MedicationCategory: String, CaseIterable, Identifiable, Codable {
    case morning = "早餐"
    case lunch = "午餐"
    case dinner = "晚餐"
    case bedtime = "睡前"
    case other = "其他"
    
    var id: String { rawValue }
}

enum DoseStatus: String, CaseIterable, Identifiable, Codable {
    case taken = "已服用"
    case skipped = "跳过"
    case missed = "未服用"
    case pending = "待服用"
    
    var id: String { rawValue }
}
