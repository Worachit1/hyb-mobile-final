# Frontend - React Native User Management App

## 🚀 Features

- ✅ Create new users with form validation
- ✅ View list of users with pagination
- ✅ Real-time API integration
- ✅ Beautiful UI with Expo Vector Icons
- ✅ Form validation (client-side + server-side)
- ✅ Error handling and loading states
- ✅ Pull-to-refresh functionality
- ✅ Responsive design

## 📋 Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Android Studio / Xcode (for emulator)
- Backend API running on `http://localhost:5000`

## 🛠️ Installation

1. **Navigate to front-end directory**

   ```bash
   cd front-end
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on device/emulator**

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

## 📱 App Structure

```
src/
├── config/
│   └── api.ts              # API configuration
├── services/
│   └── userService.ts      # API service functions
├── types/
│   └── api.ts              # TypeScript interfaces
└── screens/
    ├── MainScreen.tsx      # Main screen with tab navigation
    ├── CreateUserScreen.tsx # Create user form
    └── UserListScreen.tsx  # Users list with pagination
```

## 🔧 API Integration

The app connects to the backend API at `http://localhost:5000/api`

### Endpoints Used:

- `POST /users/create` - Create new user
- `GET /users/list` - Get users with pagination
- `GET /health` - Health check

### API Configuration:

Located in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api",
  // ... endpoints
};
```

## 📝 Features Breakdown

### 1. Create User Screen

- **Form Fields**: Name, Email, Password
- **Validation**: Real-time client-side + server-side validation
- **Password Requirements**:
  - Minimum 6 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
- **UI Features**:
  - Show/hide password toggle
  - Loading states
  - Success/error alerts
  - Form reset functionality

### 2. User List Screen

- **Features**:
  - Displays all users with pagination
  - Pull-to-refresh
  - Load more functionality
  - User avatars with initials
  - Formatted creation dates
- **Empty State**: Shows when no users exist
- **Error Handling**: Network error handling

### 3. Navigation

- **Bottom Tab Navigation** between Create User and User List
- **Active Tab Indicators**
- **Icon States** (filled/outlined based on selection)

## 🎨 UI Components

### Form Elements

- Custom input containers with icons
- Error state styling
- Password visibility toggle
- Validation feedback

### User Cards

- Avatar with user initials
- User information display
- Creation date formatting
- Consistent card design

### Loading States

- Form submission loading
- List loading indicators
- Pull-to-refresh loading

## 🔒 Validation

### Client-Side Validation

- Required field validation
- Email format validation
- Password strength validation
- Real-time error clearing

### Server-Side Validation

- Handles API validation errors
- Displays field-specific errors
- Manages duplicate email errors

## 📱 Platform Support

- ✅ **Android** - Full support
- ✅ **iOS** - Full support
- ✅ **Web** - Expo web support

## 🧪 Testing

### Manual Testing Checklist

#### Create User Form:

- [ ] Empty form validation
- [ ] Invalid email format
- [ ] Weak password validation
- [ ] Successful user creation
- [ ] Duplicate email handling
- [ ] Network error handling

#### User List:

- [ ] Load users on first launch
- [ ] Pull-to-refresh functionality
- [ ] Load more pagination
- [ ] Empty state display
- [ ] Network error handling

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## 🌐 Network Configuration

### For Physical Device Testing:

If testing on a physical device, update the API base URL in `src/config/api.ts`:

```typescript
// Replace localhost with your computer's IP address
BASE_URL: "http://YOUR_IP_ADDRESS:5000/api";
```

### Finding Your IP Address:

- **Windows**: `ipconfig` in Command Prompt
- **macOS/Linux**: `ifconfig` in Terminal

## 🐛 Troubleshooting

### Common Issues:

1. **Cannot connect to API**

   - Ensure backend server is running on port 5000
   - Check API base URL configuration
   - For physical devices, use computer's IP address instead of localhost

2. **Expo CLI issues**

   - Run `expo doctor` to check for issues
   - Clear cache: `expo r -c`

3. **Network timeout**
   - Check firewall settings
   - Ensure both devices are on same network

## 📞 Support

For issues or questions, please refer to:

- Backend API documentation
- Expo documentation
- React Native documentation
