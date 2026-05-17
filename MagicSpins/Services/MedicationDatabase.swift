import Foundation

struct MedicationInfo {
    let name: String
    let commonDosages: [String]
    let category: MedicationCategory
}

class MedicationDatabase {
    static let shared = MedicationDatabase()
    
    private let commonMedications: [MedicationInfo] = [
        MedicationInfo(name: "阿司匹林", commonDosages: ["25mg", "50mg", "100mg"], category: .other),
        MedicationInfo(name: "布洛芬", commonDosages: ["100mg", "200mg", "400mg"], category: .other),
        MedicationInfo(name: "对乙酰氨基酚", commonDosages: ["325mg", "500mg", "650mg"], category: .other),
        MedicationInfo(name: "维生素C", commonDosages: ["50mg", "100mg"], category: .other),
        MedicationInfo(name: "维生素B族", commonDosages: ["10mg", "25mg"], category: .other),
        MedicationInfo(name: "钙片", commonDosages: ["300mg", "500mg", "600mg"], category: .other),
        MedicationInfo(name: "叶酸", commonDosages: ["0.4mg", "5mg"], category: .other),
        MedicationInfo(name: "甲硝唑", commonDosages: ["0.2g", "0.25g"], category: .other),
        MedicationInfo(name: "头孢克肟", commonDosages: ["50mg", "100mg", "200mg"], category: .other),
        MedicationInfo(name: "阿奇霉素", commonDosages: ["0.25g", "0.5g"], category: .other),
        MedicationInfo(name: "氯雷他定", commonDosages: ["5mg", "10mg"], category: .other),
        MedicationInfo(name: "蒙脱石散", commonDosages: ["3g"], category: .other),
        MedicationInfo(name: "奥美拉唑", commonDosages: ["10mg", "20mg"], category: .other),
        MedicationInfo(name: "二甲双胍", commonDosages: ["0.25g", "0.5g"], category: .other),
        MedicationInfo(name: "格列齐特", commonDosages: ["30mg", "80mg"], category: .other),
        MedicationInfo(name: "硝苯地平", commonDosages: ["5mg", "10mg", "20mg"], category: .other),
        MedicationInfo(name: "缬沙坦", commonDosages: ["40mg", "80mg", "160mg"], category: .other),
        MedicationInfo(name: "美托洛尔", commonDosages: ["12.5mg", "25mg", "50mg"], category: .other),
        MedicationInfo(name: "阿托伐他汀", commonDosages: ["10mg", "20mg", "40mg"], category: .other),
        MedicationInfo(name: "瑞舒伐他汀", commonDosages: ["5mg", "10mg", "20mg"], category: .other),
        MedicationInfo(name: "左甲状腺素钠", commonDosages: ["25μg", "50μg", "100μg"], category: .other),
        MedicationInfo(name: "泼尼松", commonDosages: ["5mg", "10mg"], category: .other),
        MedicationInfo(name: "地塞米松", commonDosages: ["0.75mg"], category: .other),
        MedicationInfo(name: "泮托拉唑", commonDosages: ["20mg", "40mg"], category: .other),
        MedicationInfo(name: "多潘立酮", commonDosages: ["10mg"], category: .other),
        MedicationInfo(name: "复方甘草片", commonDosages: ["含甘草酸"], category: .other),
        MedicationInfo(name: "氨溴索", commonDosages: ["30mg", "60mg"], category: .other),
        MedicationInfo(name: "右美沙芬", commonDosages: ["15mg", "30mg"], category: .other),
        MedicationInfo(name: "孟鲁司特", commonDosages: ["4mg", "5mg", "10mg"], category: .other),
        MedicationInfo(name: "西替利嗪", commonDosages: ["5mg", "10mg"], category: .other),
    ]
    
    private let frequencyPatterns: [(pattern: String, frequency: Frequency)] = [
        ("每日\\s*1-2\\s*次", .twiceDaily),
        ("每日\\s*1\\s*次", .daily),
        ("每日\\s*2\\s*次", .twiceDaily),
        ("每日\\s*3\\s*次", .threeTimesDaily),
        ("每日\\s*4\\s*次", .fourTimesDaily),
        ("每晚\\s*1\\s*次", .daily),
        ("睡前", .daily),
        ("饭前", .daily),
        ("饭后", .daily),
        ("餐前", .daily),
        ("餐后", .daily),
        ("必要时", .asNeeded),
        ("遵医嘱", .asNeeded),
    ]
    
    private init() {}
    
    func findMedication(name: String) -> MedicationInfo? {
        let normalizedName = name.lowercased().trimmingCharacters(in: .whitespaces)
        
        for medication in commonMedications {
            let medName = medication.name.lowercased()
            if medName.contains(normalizedName) || normalizedName.contains(medName) {
                return medication
            }
        }
        
        return nil
    }
    
    func parseDosage(from text: String) -> String? {
        let patterns = [
            "(\\d+(?:\\.\\d+)?)\\s*g",
            "(\\d+(?:\\.\\d+)?)\\s*mg",
            "(\\d+(?:\\.\\d+)?)\\s*ml",
            "(\\d+(?:\\.\\d+)?)\\s*μg"
        ]
        
        for pattern in patterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
                let range = NSRange(text.startIndex..., in: text)
                if let match = regex.firstMatch(in: text, options: [], range: range),
                   let matchRange = Range(match.range(at: 1), in: text) {
                    let number = text[matchRange]
                    let unit = pattern.contains("g") ? "g" : (pattern.contains("ml") ? "ml" : "mg")
                    return "\(number)\(unit)"
                }
            }
        }
        return nil
    }
    
    func parseFrequency(from text: String) -> Frequency? {
        for (pattern, frequency) in frequencyPatterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
                let range = NSRange(text.startIndex..., in: text)
                if regex.firstMatch(in: text, options: [], range: range) != nil {
                    return frequency
                }
            }
        }
        return nil
    }
    
    func getSuggestedDosages(for medicationName: String) -> [String] {
        if let info = findMedication(name: medicationName) {
            return info.commonDosages
        }
        return ["10mg", "25mg", "50mg", "100mg"]
    }
}
