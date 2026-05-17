import SwiftUI
import UIKit

struct MedicationScannerView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var showImagePicker = false
    @State private var sourceType: UIImagePickerController.SourceType = .photoLibrary
    @State private var selectedImage: UIImage?
    @State private var isScanning = false
    @State private var scanResult: ScanResult?
    @State private var showError = false
    @State private var errorMessage = ""
    
    var onScanComplete: (ScanResult) -> Void
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if let scanResult = scanResult {
                    scanResultView(scanResult)
                } else {
                    emptyStateView
                }
            }
            .padding()
            .navigationTitle("智能识别")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showImagePicker) {
                ImagePicker(sourceType: sourceType) { image in
                    selectedImage = image
                    performOCR(image)
                }
            }
            .alert("错误", isPresented: $showError) {
                Button("确定") { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 32) {
            Spacer()
            
            VStack(spacing: 16) {
                Image(systemName: "camera.viewfinder")
                    .font(.system(size: 80))
                    .foregroundColor(AppColors.primary)
                
                Text("拍照识别药品")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("拍摄药品包装盒或处方单\n自动识别药品信息")
                    .font(.subheadline)
                    .foregroundColor(AppColors.secondaryText)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 12) {
                Button {
                    sourceType = .camera
                    showImagePicker = true
                } label: {
                    HStack {
                        Image(systemName: "camera.fill")
                        Text("拍照")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppColors.primary)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                
                Button {
                    sourceType = .photoLibrary
                    showImagePicker = true
                } label: {
                    HStack {
                        Image(systemName: "photo.fill")
                        Text("从相册选择")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white)
                    .foregroundColor(AppColors.primary)
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(AppColors.primary, lineWidth: 1)
                    )
                }
            }
            
            Spacer()
        }
    }
    
    private func scanResultView(_ result: ScanResult) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                if let image = selectedImage {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .cornerRadius(12)
                        .frame(maxHeight: 200)
                }
                
                VStack(alignment: .leading, spacing: 16) {
                    Text("识别结果")
                        .font(.headline)
                        .foregroundColor(AppColors.primaryText)
                    
                    VStack(alignment: .leading, spacing: 12) {
                        resultField(
                            label: "药品名称",
                            value: result.detectedMedicationName ?? "未识别到",
                            isPlaceholder: result.detectedMedicationName == nil
                        )
                        
                        resultField(
                            label: "剂量",
                            value: result.detectedDosage ?? "未识别到",
                            isPlaceholder: result.detectedDosage == nil
                        )
                        
                        resultField(
                            label: "频率",
                            value: result.detectedFrequency ?? "未识别到",
                            isPlaceholder: result.detectedFrequency == nil
                        )
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("完整识别文字")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(AppColors.secondaryText)
                        
                        Text(result.rawText.isEmpty ? "没有识别到文字" : result.rawText)
                            .font(.caption)
                            .foregroundColor(AppColors.secondaryText)
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(8)
                    }
                }
                .padding()
                .background(Color.white)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
                
                VStack(spacing: 12) {
                    Button {
                        onScanComplete(result)
                        dismiss()
                    } label: {
                        HStack {
                            Image(systemName: "checkmark")
                            Text("使用识别结果")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(AppColors.primary)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    
                    Button {
                        scanResult = nil
                        selectedImage = nil
                    } label: {
                        HStack {
                            Image(systemName: "arrow.counterclockwise")
                            Text("重新识别")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .foregroundColor(AppColors.primary)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(AppColors.primary, lineWidth: 1)
                        )
                    }
                }
            }
        }
    }
    
    private func resultField(label: String, value: String, isPlaceholder: Bool) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.subheadline)
                .foregroundColor(AppColors.secondaryText)
            
            Text(value)
                .font(.body)
                .foregroundColor(isPlaceholder ? AppColors.secondaryText : AppColors.primaryText)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(isPlaceholder ? Color.gray.opacity(0.05) : Color.gray.opacity(0.1))
                .cornerRadius(8)
        }
    }
    
    private func performOCR(_ image: UIImage) {
        isScanning = true
        
        OCRService.shared.recognizeText(from: image) { text, error in
            DispatchQueue.main.async {
                isScanning = false
                
                if let error = error {
                    errorMessage = error.localizedDescription
                    showError = true
                    return
                }
                
                if let text = text {
                    scanResult = OCRService.shared.parseScanResult(text)
                    scanResult?.imageData = image.jpegData(compressionQuality: 0.8)
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        MedicationScannerView { result in
            print("Scan complete: \(result)")
        }
    }
}
