# MagicSpins V2 - AI智能识别功能实现计划

## 📋 概述

实现拍照识别药品/处方功能，使用 Apple Vision 框架进行文字识别。

---

## 🎯 功能列表

### 第一阶段：基础功能（MVP）
- ✅ 添加相机/相册访问权限
- ✅ 拍照或从相册选择图片
- ✅ 使用 Vision 进行 OCR 文字识别
- ✅ 显示识别结果界面
- ✅ 手动编辑识别结果并填充表单

### 第二阶段：智能解析（进阶）
- ✅ 智能解析药品名称
- ✅ 智能解析剂量信息
- ✅ 智能解析频率信息
- ✅ 药品数据库匹配

---

## 📁 文件结构

```
MagicSpins/
├── Views/
│   └── Medication/
│       ├── AddMedicationView.swift (更新)
│       └── MedicationScannerView.swift (新增)
├── Services/
│   ├── OCRService.swift (更新)
│   └── MedicationDatabase.swift (新增)
└── Models/
    └── ScanResult.swift (新增)
```

---

## 🔧 技术实现

### 1. 权限配置
- Info.plist 添加相机/相册权限描述

### 2. 相机/图片选择器
- 使用 PHPickerViewController 或 PhotosPicker
- 或 UIImagePickerController（兼容更多版本）

### 3. OCR识别
- 使用 VNRecognizeTextRequest
- 支持中文和英文识别
- 返回识别的文字字符串

---

## ⏱ 预计时间

- 基础功能：2-3小时
- 智能解析：额外2-3小时（可选）
