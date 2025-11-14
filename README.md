<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🏡 Balkan Estate - Real Estate Platform

A modern real estate platform for the Balkan region with AI-powered features, built with React, TypeScript, Node.js, and MongoDB.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)](https://www.mongodb.com/)

## ✨ Features

### 🔐 User Management
- **JWT Authentication** - Secure user registration and login
- **User Roles** - Buyers, Private Sellers, and Agents
- **Profile Management** - Update user information and preferences

### 🏠 Property Listings
- **Create Listings** - Add properties with detailed information
- **AI-Powered Description** - Generate property descriptions from images using Google Gemini AI
- **Ownership Protection** - Only property owners can edit/delete their listings
- **Advanced Search** - Filter by price, location, bedrooms, bathrooms, and more
- **Map Integration** - Interactive map with property locations using Leaflet

### ❤️ Favorites & Saved Searches
- **Save Properties** - Bookmark favorite properties
- **Saved Searches** - Store search filters and map bounds for later use
- **Persistent Storage** - All data saved to MongoDB database

### 💬 Messaging
- **Buyer-Seller Communication** - Direct messaging between interested buyers and property sellers
- **Conversation History** - All messages stored and accessible
- **Unread Tracking** - Track unread messages

### 📸 Media Management
- **Image Upload** - Upload multiple property images
- **Cloud Storage** - Images stored in Cloudinary
- **Image Gallery** - Beautiful property image galleries

### 🤖 AI Features
- **AI Property Analysis** - Extract property details from photos
- **AI Search Assistant** - Natural language property search
- **Neighborhood Insights** - AI-powered area information

## 🏗️ Architecture

```
Frontend (React + TypeScript + Vite)
    ↓ REST API
Backend (Node.js + Express + TypeScript)
    ↓ Mongoose ODM
Database (MongoDB)

Cloud Storage: Cloudinary
AI: Google Gemini
Maps: Leaflet + OpenStreetMap
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB 6 or higher
- Cloudinary account (free tier available)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZaniDalipi/BalkanEstateWebVersion.git
   cd BalkanEstateWebVersion
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**

   **Frontend** (`.env` in project root):
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

   **Backend** (`backend/.env`):
   ```env
   PORT=5001
   NODE_ENV=development

   # MongoDB connection
   MONGODB_URI=mongodb://localhost:27017/balkan-estate

   # JWT secret (change in production!)
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d

   # Cloudinary credentials
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Or manually
   mongod
   ```

5. **Run the application**

   **Option A: Using the startup script** (recommended)
   ```bash
   ./start-dev.sh
   ```

   **Option B: Manual start**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Open the application**

   Visit [http://localhost:5173](http://localhost:5173)

## 📚 Documentation

- **[Integration Guide](INTEGRATION_GUIDE.md)** - Complete setup instructions
- **[Backend README](backend/README.md)** - Backend API documentation
- **[API Endpoints](backend/README.md#api-endpoints)** - Full API reference

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **Google Gemini AI** - AI features
- **Context API + useReducer** - State management

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File uploads

### DevOps & Tools
- **nodemon** - Development auto-reload
- **ts-node** - TypeScript execution
- **helmet** - Security headers
- **cors** - Cross-origin requests
- **compression** - Response compression

## 📁 Project Structure

```
BalkanEstateWebVersion/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Database, Cloudinary setup
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation
│   │   ├── utils/             # Helper functions
│   │   └── server.ts          # Express server
│   ├── .env                   # Backend config
│   └── package.json
│
├── src/                       # Frontend source
├── components/                # React components
│   ├── BuyerFlow/            # Buyer interface
│   ├── SellerFlow/           # Seller interface
│   ├── auth/                 # Authentication
│   └── shared/               # Shared components
├── context/                   # React Context
├── services/                  # API services
│   ├── apiService.ts         # Backend API client
│   ├── geminiService.ts      # AI integration
│   └── osmService.ts         # Map services
├── utils/                     # Utility functions
├── types.ts                   # TypeScript types
├── .env                       # Frontend config
├── package.json
└── vite.config.ts
```

## 🔒 Security Features

- ✅ JWT authentication with secure tokens
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Ownership validation (users can only edit their own properties)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Environment variable protection

## 🧪 Testing

```bash
# Backend tests (coming soon)
cd backend
npm test

# Frontend tests (coming soon)
npm test
```

## 📊 Database Schema

### Collections
- **users** - User accounts and profiles
- **properties** - Property listings
- **favorites** - User's saved properties
- **savedsearches** - Saved search filters
- **conversations** - Chat conversations
- **messages** - Individual messages

See [backend/README.md](backend/README.md) for detailed schema documentation.

## 🚢 Deployment

### Backend Deployment

Deploy to Heroku, AWS, Azure, or DigitalOcean. See [backend/README.md](backend/README.md#deployment) for detailed instructions.

### Frontend Deployment

```bash
npm run build
# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC License

## 👨‍💻 Authors

- **Zani Dalipi** - [GitHub](https://github.com/ZaniDalipi)

## 🙏 Acknowledgments

- Google Gemini AI for AI-powered features
- OpenStreetMap for map data
- Cloudinary for image hosting
- The React and Node.js communities

## 📞 Support

For issues and questions:
- Open an issue on [GitHub Issues](https://github.com/ZaniDalipi/BalkanEstateWebVersion/issues)
- Check the [Integration Guide](INTEGRATION_GUIDE.md)
- Review [Backend Documentation](backend/README.md)

## 🗺️ Roadmap

- ✅ Core backend integration
- ✅ User authentication
- ✅ Property management with ownership
- ✅ Favorites and saved searches
- ✅ Messaging system
- ⬜ Social login (Google, Facebook, Apple)
- ⬜ Email verification
- ⬜ Password reset
- ⬜ Real-time messaging (WebSockets)
- ⬜ Advanced analytics
- ⬜ Mobile app (React Native)

---

Built with ❤️ for the Balkan region
