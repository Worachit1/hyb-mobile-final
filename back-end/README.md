# Backend API - User Management System

## 🚀 Features

- ✅ User registration with validation
- ✅ Password hashing with bcrypt
- ✅ Email uniqueness validation
- ✅ Comprehensive input validation
- ✅ Error handling and logging
- ✅ Pagination support
- ✅ MongoDB integration
- ✅ TypeScript support
- ✅ CORS configuration

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory**

   ```bash
   cd back-end
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/hyb-mobile-app
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm run start
   ```

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

### Health Check

- **GET** `/health` - Check server status

### Users

- **POST** `/users/create` - Create new user
- **GET** `/users/list` - Get all users (with pagination)
- **GET** `/users/:id` - Get user by ID

## 📝 API Usage Examples

### Create User

```json
POST /api/users/create
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-10-06T...",
    "updatedAt": "2025-10-06T..."
  }
}
```

### Get Users with Pagination

```json
GET /api/users/list?page=1&limit=10
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🔒 Validation Rules

### User Registration

- **Name**: Required, 2-50 characters
- **Email**: Required, valid email format, unique
- **Password**: Required, minimum 6 characters, must contain:
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number

## 🗂️ Project Structure

```
back-end/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection
│   ├── controllers/
│   │   └── userController.ts    # User business logic
│   ├── middleware/
│   │   ├── errorHandler.ts      # Error handling middleware
│   │   ├── logger.ts            # Request logging
│   │   └── validation.ts        # Input validation rules
│   ├── models/
│   │   └── User.ts              # User data model
│   ├── routes/
│   │   └── userRoutes.ts        # API routes
│   └── index.ts                 # Main server file
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

See `API_TESTING.md` for detailed testing examples and commands.

## 🔧 Available Scripts

- `npm run start` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run prod` - Run production server

## 🛡️ Security Features

- **Password Hashing**: Using bcrypt with salt rounds
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error responses
- **CORS**: Configured for frontend integration
- **Data Sanitization**: Trimming and normalizing inputs

## 🔄 Database Schema

### User Model

```typescript
{
  name: string,        // Required, 2-50 chars
  email: string,       // Required, unique, valid email
  password: string,    // Required, hashed, min 6 chars
  createdAt: Date,     // Auto-generated
  updatedAt: Date      // Auto-generated
}
```

## 🐛 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]       // Optional: detailed validation errors
}
```

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.
