# นายวรชิต ทองเลิศ 653450298-2

# 📱 Social Media App - React Native

แอปพลิเคชันโซเชียลมีเดียที่พัฒนาด้วย React Native และ Expo สำหรับโครงงานวิชา Hybrid Mobile Application Programming

## 🌟 Features (คุณสมบัติ)

### 🔐 Authentication (การยืนยันตัวตน)
- เข้าสู่ระบบด้วย Email และ Password
- สมัครสมาชิกใหม่
- ระบบ JWT Token Authentication
- จัดเก็บ Session แบบ Persistent

### 📝 Social Features (คุณสมบัติโซเชียล)
- **โพสต์เนื้อหา**: สร้างและแชร์เนื้อหาข้อความ
- **ระบบไลค์**: กดไลค์/เลิกไลค์โพสต์ได้
- **ระบบคอมเมนท์**: 
  - เพิ่มคอมเมนท์ในโพสต์
  - ดูคอมเมนท์ทั้งหมดแบบ Modal
  - ลบคอมเมนท์ของตัวเอง
- **จัดการโพสต์ส่วนตัว**: ดูและลบโพสต์ของตัวเอง

### 👤 Profile Management (จัดการโปรไฟล์)
- ดูข้อมูลโปรไฟล์ส่วนตัว
- แก้ไขข้อมูลโปรไฟล์
- ดูรายชื่อผู้ใช้ทั้งหมด

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI Components**: React Native Elements
- **Backend API**: KKU CIS API (https://cis.kku.ac.th/api/classroom)

## 📁 Project Structure

```
src/
├── config/
│   └── api.ts                 # API configuration
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── screens/
│   ├── AuthScreen.tsx         # Main auth screen
│   ├── LoginScreen.tsx        # Login form
│   ├── RegisterScreen.tsx     # Registration form
│   ├── CreateUserScreen.tsx   # User creation
│   ├── MainScreen.tsx         # Main social feed
│   ├── ProfileScreen.tsx      # User profile
│   └── UserListScreen.tsx     # All users list
├── services/
│   ├── authService.ts         # Authentication services
│   └── statusService.ts       # Social media services
└── types/
    └── api.ts                 # TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 หรือใหม่กว่า)
- npm หรือ yarn
- Expo CLI
- Android Studio หรือ Xcode (สำหรับ emulator)

### Installation

1. **Clone repository**
```bash
git clone [repository-url]
cd front-end
```

2. **Install dependencies**
```bash
npm install
# หรือ
yarn install
```

3. **Start development server**
```bash
npx expo start
```

4. **Run on device/emulator**
- กด `a` สำหรับ Android
- กด `i` สำหรับ iOS
- สแกน QR code ด้วย Expo Go app

## 🔧 Configuration

### API Configuration
แก้ไขไฟล์ `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  baseURL: 'https://cis.kku.ac.th/api/classroom',
  apiKey: 'your-api-key',
  timeout: 10000,
};
```

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/register` - สมัครสมาชิก

### Social Features
- `GET /status` - ดึงโพสต์ทั้งหมด
- `POST /status` - สร้างโพสต์ใหม่
- `DELETE /status/:id` - ลบโพสต์
- `POST /comment` - เพิ่มคอมเมนท์
- `DELETE /comment/:id` - ลบคอมเมนท์
- `POST /like` - ไลค์โพสต์
- `DELETE /like` - เลิกไลค์โพสต์

### User Management
- `GET /user` - ดึงข้อมูลผู้ใช้ทั้งหมด
- `PUT /user` - แก้ไขโปรไฟล์

## 🎨 Key Components

### SocialFeedScreen
หน้าจอหลักที่แสดงฟีดโซเชียล รองรับ:
- แสดงโพสต์ทั้งหมด
- ระบบไลค์แบบ Real-time
- การดูและเพิ่มคอมเมนท์
- การลบโพสต์และคอมเมนท์ของตัวเอง

### AuthContext
จัดการสถานะการยืนยันตัวตนทั้งแอป:
- Login/Logout
- จัดเก็บ Token
- Auto-login เมื่อเปิดแอป

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📱 Build for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## 🐛 Known Issues

- การลบคอมเมนท์อาจต้องใช้เวลาในการอัพเดท UI
- การอัพโหลดรูปภาพยังไม่รองรับ
- การแจ้งเตือน (Push Notifications) ยังไม่พร้อมใช้งาน

## 🔮 Future Enhancements

- [ ] อัพโหลดรูปภาพในโพสต์
- [ ] ระบบแจ้งเตือน Push Notifications
- [ ] การแชร์โพสต์
- [ ] ระบบแท็กเพื่อน
- [ ] Dark Mode
- [ ] ฟีเจอร์ Stories
- [ ] ระบบแชท Real-time

## 👥 Contributors

- **Developer**: [Your Name]
- **Course**: IN405109 Hybrid Mobile Application Programming
- **University**: มหาวิทยาลัยขอนแก่น (KKU)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. เปิด Issue ใน GitHub repository
2. ติดต่อผ่าน email: [your-email]
3. ดูเอกสาร API: https://cis.kku.ac.th/api/docs

---

**หมายเหตุ**: โปรเจคนี้เป็นส่วนหนึ่งของการเรียนวิชา Hybrid Mobile Application Programming คณะวิทยาศาสตร์ประยุกต์และวิศวกรรมศาสตร์ มหาวิทยาลัยขอนแก่น
