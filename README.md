# ChatMassage 💬

A production-ready Telegram-inspired real-time chat application with secure email OTP authentication.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen)
![Socket.io](https://img.shields.io/badge/Socket.io-4+-black)

## ✨ Features

### Authentication
- 📧 **Email-based login** - No passwords required
- 🔐 **Secure OTP** - 6-digit code with bcrypt hashing
- ⏱️ **OTP expiration** - 5-minute validity
- 🛡️ **Attempt limiting** - Max 5 verification attempts
- 🎫 **JWT tokens** - Secure session management
- 👤 **Auto-registration** - New users created automatically

### Real-time Chat
- 💬 **One-to-one messaging** - Private conversations
- ⚡ **Real-time delivery** - Instant message updates via Socket.io
- 🟢 **Online status** - See who's online
- ✓✓ **Message status** - Sent and seen indicators
- ⌨️ **Typing indicators** - See when someone is typing
- 📱 **Responsive design** - Works on desktop and mobile
- 🌙 **Dark mode** - Modern dark theme UI

### Security
- 🔒 **Rate limiting** - Prevents brute force attacks
- 🔑 **Token-based auth** - Protected routes and WebSocket
- ✅ **Input validation** - Server-side validation
- 🗄️ **Hashed OTPs** - Never stored in plain text

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT + bcrypt
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **WebSocket**: Socket.io Client

## 📁 Project Structure

```
chatmassage/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middlewares/    # Auth & rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Email service
│   │   ├── socket/         # Socket.io handlers
│   │   ├── utils/          # Helper functions
│   │   └── app.js          # Express app entry
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── contexts/       # React contexts
    │   ├── pages/          # Page components
    │   ├── services/       # API service
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install

```bash
# Navigate to project directory
cd chatmassage

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env)**:
```env
MONGODB_URI=mongodb://localhost:27017/chatmassage
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5

# Optional: SMTP for real emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 4. Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 5. Open in Browser

Navigate to `http://localhost:5173`

> **Note**: In development mode without SMTP configured, OTP codes are logged to the backend console.

## 📡 API Documentation

### Authentication

#### Request OTP
```http
POST /auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Search Users
```http
GET /auth/users?search=john
Authorization: Bearer <token>
```

### Chats

#### Get All Chats
```http
GET /chats
Authorization: Bearer <token>
```

#### Create/Get Chat
```http
POST /chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "user_id_here"
}
```

### Messages

#### Get Messages
```http
GET /messages/:chatId?limit=50
Authorization: Bearer <token>
```

#### Send Message (REST fallback)
```http
POST /messages/:chatId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello!"
}
```

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `chatId` | Join a chat room |
| `leave` | `chatId` | Leave a chat room |
| `send_message` | `{ chatId, content }` | Send a message |
| `mark_seen` | `{ chatId }` | Mark messages as seen |
| `typing` | `{ chatId, isTyping }` | Typing indicator |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `{ message }` | New message received |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId, lastSeen }` | User went offline |
| `messages_seen` | `{ chatId, userId }` | Messages marked as seen |
| `user_typing` | `{ userId, isTyping }` | Typing indicator |
| `chat_updated` | `{ chatId, lastMessage }` | Chat list update |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Auth Pages  │  │ Chat Pages  │  │  Socket.io Client   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Express    │  │ Socket.io   │  │    Middleware       │  │
│  │  REST API   │  │  Server     │  │  (Auth, RateLimit)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                            │                                 │
│              ┌─────────────┴─────────────┐                  │
│              │       MongoDB             │                  │
│              │  Users, Chats, Messages   │                  │
│              └───────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔮 Future Improvements

1. **Message Features**
   - Message editing and deletion
   - File/image attachments
   - Voice messages
   - Message reactions

2. **Group Chats**
   - Create group conversations
   - Admin roles and permissions
   - Add/remove members

3. **Enhanced UI**
   - Message search
   - Chat pinning
   - Custom themes
   - Emoji picker

4. **Notifications**
   - Push notifications
   - Email notifications for offline users
   - Desktop notifications

5. **Security Enhancements**
   - End-to-end encryption
   - Two-factor authentication
   - Session management

6. **Performance**
   - Message pagination with infinite scroll
   - Redis for session storage
   - CDN for static assets

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own chat application.

---

Built with ❤️ using Node.js, React, and Socket.io
