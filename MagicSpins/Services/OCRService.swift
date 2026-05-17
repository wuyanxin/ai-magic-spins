import Vision
import UIKit

class OCRService {
    static let shared = OCRService()
    
    private let medicationDatabase = MedicationDatabase.shared
    
    private init() {}
    
    func recognizeText(from image: UIImage, completion: @escaping (String?, Error?) -> Void) {
        guard let cgImage = image.cgImage else {
            completion(nil, NSError(domain: "OCRService", code: 0, userInfo: [NSLocalizedDescriptionKey: "无法处理图片"]))
            return
        }
        
        let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        
        let request = VNRecognizeTextRequest { request, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let observations = request.results as? [VNRecognizedTextObservation] else {
                completion("", nil)
                return
            }
            
            let recognizedText = observations.compactMap { observation in
                observation.topCandidates(1).first?.string
            }.joined(separator: "\n")
            
            completion(recognizedText, nil)
        }
        
        request.recognitionLanguages = ["zh-Hans", "en-US"]
        request.usesLanguageCorrection = true
        
        do {
            try requestHandler.perform([request])
        } catch {
            completion(nil, error)
        }
    }
    
    func recognizeAndParse(from image: UIImage, completion: @escaping (ScanResult?, Error?) -> Void) {
        recognizeText(from: image) { [weak self] text, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let text = text, !text.isEmpty else {
                completion(nil, nil)
                return
            }
            
            let result = self?.parseScanResult(text)
            completion(result, nil)
        }
    }
    
    func parseScanResult(_ text: String) -> ScanResult {
        var result = ScanResult(rawText: text)
        
        let lines = text.components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
        
        result.detectedMedicationName = extractMedicationName(from: lines)
        result.detectedDosage = extractDosage(from: text)
        result.detectedFrequency = extractFrequency(from: text)
        
        return result
    }
    
    private func extractMedicationName(from lines: [String]) -> String? {
        for line in lines {
            let cleanedLine = cleanMedicationLine(line)
            
            if cleanedLine.count >= 2 {
                if let match = medicationDatabase.findMedication(name: cleanedLine) {
                    return match.name
                }
            }
            
            if isLikelyMedicationName(cleanedLine) {
                return cleanedLine
            }
        }
        
        return lines.first
    }
    
    private func cleanMedicationLine(_ line: String) -> String {
        var cleaned = line
        
        let removePatterns = [
            "\\d+\\s*[gmgmluid]*(?:/\\s*\\w+)?",
            "\\([^)]{0,20}\\)",
            "【[^】]+】",
            "\\[[^\\]]+\\]",
            "\\d+片|\\d+粒|\\d+颗|\\d+丸",
            "每次|每日|饭前|饭后|早中晚|早餐|午餐|晚餐"
        ]
        
        for pattern in removePatterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
                cleaned = regex.stringByReplacingMatches(in: cleaned, options: [], range: NSRange(cleaned.startIndex..., in: cleaned), withTemplate: "")
            }
        }
        
        return cleaned.trimmingCharacters(in: .whitespaces)
    }
    
    private func isLikelyMedicationName(_ text: String) -> Bool {
        let medicationIndicators = [
            "胶囊", "片", "丸", "颗粒", "冲剂", "口服液",
            "注射", "软膏", "贴", "滴眼", "喷雾",
            "药", "素", "汀", "唑", "定", "平", "灵"
        ]
        
        for indicator in medicationIndicators {
            if text.contains(indicator) && text.count >= 3 && text.count <= 20 {
                return true
            }
        }
        
        return false
    }
    
    private func extractDosage(from text: String) -> String? {
        if let dosage = medicationDatabase.parseDosage(from: text) {
            return dosage
        }
        
        let patterns: [(String, String)] = [
            ("(\\d+(?:\\.\\d+)?\\s*[μm]?g)", "剂量"),
            ("(\\d+(?:\\.\\d+)?\\s*ml)", "剂量"),
            ("(\\d+\\s*片/次)", "剂量"),
            ("(\\d+\\s*粒/次)", "剂量"),
            ("(每次?\\s*\\d+(?:\\.\\d+)?[μm]?g)", "剂量"),
            ("(每[次日餐]\\s*\\d+(?:\\.\\d+)?[μm]?g)", "剂量"),
        ]
        
        for (pattern, _) in patterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
                let range = NSRange(text.startIndex..., in: text)
                if let match = regex.firstMatch(in: text, options: [], range: range) {
                    if let matchRange = Range(match.range, in: text) {
                        return String(text[matchRange]).trimmingCharacters(in: .whitespaces)
                    }
                }
            }
        }
        
        return nil
    }
    
    private func extractFrequency(from text: String) -> String? {
        let patterns: [(String, String)] = [
            ("(每日\\s*[1-4]?\\s*次)", "频率"),
            ("(每[天日]\\s*[1-4]?\\s*[次服粒片])", "频率"),
            ("(每天\\s*[1-4]?\\s*次)", "频率"),
            ("(每[早晚午夜]\\s*[1-2]?\\s*次)", "频率"),
            ("(早中晚\\s*[各]?\\s*\\d+?\\s*[次粒片]?)", "频率"),
            ("(每[餐顿饭]\\s*[前后]?\\s*[各]?\\s*\\d+?\\s*[次粒片]?)", "频率"),
            ("(饭前\\s*[半小]?\\s*时?)", "频率"),
            ("(饭后\\s*[半小]?\\s*时?)", "频率"),
            ("(睡前\\s*[半小]?\\s*时?)", "频率"),
            ("(必要时|按需|需要时)", "频率"),
            ("(\\d+\\s*小时\\s*[一次]?)", "频率"),
            ("((\\d+\\s*~\\s*\\d+)\\s*小时\\s*一次)", "频率"),
        ]
        
        for (pattern, _) in patterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
                let range = NSRange(text.startIndex..., in: text)
                if let match = regex.firstMatch(in: text, options: [], range: range) {
                    if let matchRange = Range(match.range, in: text) {
                        return String(text[matchRange]).trimmingCharacters(in: .whitespaces)
                    }
                }
            }
        }
        
        return nil
    }
    
    func getSuggestedDosages(for medicationName: String) -> [String] {
        return medicationDatabase.getSuggestedDosages(for: medicationName)
    }
    
    func getSuggestedFrequency(from text: String) -> Frequency? {
        return medicationDatabase.parseFrequency(from: text)
    }
}
