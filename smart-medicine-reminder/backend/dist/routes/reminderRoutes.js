"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Reminder_1 = __importDefault(require("../models/Reminder"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reminders = yield Reminder_1.default.find()
            .populate('medicineId')
            .populate('familyMemberId');
        res.json(reminders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reminder = yield Reminder_1.default.findById(req.params.id)
            .populate('medicineId')
            .populate('familyMemberId');
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        res.json(reminder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newReminder = new Reminder_1.default(req.body);
        const savedReminder = yield newReminder.save();
        res.status(201).json(savedReminder);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
router.post('/trigger/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reminder = yield Reminder_1.default.findById(req.params.id)
            .populate('medicineId')
            .populate('familyMemberId');
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        const familyMember = reminder.familyMemberId;
        if (familyMember.feishuUserId) {
            yield sendFeishuMessage(familyMember.feishuUserId, reminder);
        }
        reminder.status = 'sent';
        yield reminder.save();
        res.json({ message: 'Reminder sent successfully', reminder });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
function sendFeishuMessage(userId, reminder) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield getFeishuToken();
        const medicine = reminder.medicineId;
        const message = {
            user_id: userId,
            msg_type: 'text',
            content: {
                text: `\u63d0\u9192\uFF1A\u8BF7\u5403\u836F\uFF01\n\u836F\u54C1\uFF1A${medicine.name}\n\u65F6\u95F4\uFF1A${reminder.scheduledTime}\n\u91CF\uFF1A${medicine.schedules.map((s) => s.dosage).join(', ')}`
            }
        };
        yield axios_1.default.post('https://open.feishu.cn/open-apis/message/v4/send/', message, { headers: { Authorization: `Bearer ${token}` } });
    });
}
function getFeishuToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/', {
            app_id: process.env.FEISHU_APP_ID,
            app_secret: process.env.FEISHU_APP_SECRET
        });
        return response.data.tenant_access_token;
    });
}
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedReminder = yield Reminder_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        res.json(updatedReminder);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedReminder = yield Reminder_1.default.findByIdAndDelete(req.params.id);
        if (!deletedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        res.json({ message: 'Reminder deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
