import Vision
import UIKit

class OCRService {
    static let shared = OCRService()
    
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
    
    func parseScanResult(_ text: String) -> ScanResult {
        var result = ScanResult(rawText: text)
        
        let lines = text.components(separatedBy: .newlines)
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
        
        if !lines.isEmpty {
            result.detectedMedicationName = lines[0]
        }
        
        for line in lines {
            if line.contains("mg") || line.contains("g") || line.contains("ml") || line.contains("片") || line.contains("粒") {
                result.detectedDosage = line
            }
            
            if line.contains("每日") || line.contains("次") || line.contains("小时") {
                result.detectedFrequency = line
            }
        }
        
        return result
    }
}
