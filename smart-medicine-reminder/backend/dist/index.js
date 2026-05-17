"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const familyRoutes_1 = __importDefault(require("./routes/familyRoutes"));
const medicineRoutes_1 = __importDefault(require("./routes/medicineRoutes"));
const reminderRoutes_1 = __importDefault(require("./routes/reminderRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-medicine-reminder')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
app.use('/api/family', familyRoutes_1.default);
app.use('/api/medicine', medicineRoutes_1.default);
app.use('/api/reminder', reminderRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
