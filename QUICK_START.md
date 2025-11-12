# 🚀 Quick Start Guide - Balkan Estate

This is the **fastest way** to get your Balkan Estate application running with the backend integration.

## ⚡ Super Quick Setup (5 minutes)

### 1. Install MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
Download from [mongodb.com/download](https://www.mongodb.com/try/download/community) and follow installer.

### 2. Get Cloudinary Credentials (1 minute)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up (free)
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Configure Backend

```bash
cd backend

# Copy example env file
cp .env.example .env

# Edit .env file
# Replace these values:
# - CLOUDINARY_CLOUD_NAME=your-cloud-name
# - CLOUDINARY_API_KEY=your-api-key
# - CLOUDINARY_API_SECRET=your-api-secret
```

That's it! MongoDB URI is already set to local MongoDB.

### 4. Run the App

**Option A: Automatic (Recommended)**
```bash
# From project root
./start-dev.sh
```

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (new terminal)
npm run dev
```

### 5. Open Browser

Visit: **http://localhost:5173**

## ✅ Test the Integration

1. **Sign Up**: Create a new account → Data saved in MongoDB ✅
2. **Create Listing**: Add a property → Only you can edit it ✅
3. **Add to Favorites**: Heart a property → Saved to your account ✅
4. **Save Search**: Apply filters and save → Persisted in database ✅

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error**: `MongoNetworkError: failed to connect`

**Fix**:
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Fix**:
```bash
# Find what's using the port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### TypeScript Errors

**Fix**:
```bash
cd backend
npm install
```

## 📂 File Locations

- **Backend Config**: `backend/.env`
- **Frontend Config**: `.env`
- **Backend Logs**: Check terminal or `backend.log`
- **API Health Check**: http://localhost:5000/health

## 🎯 What's Integrated

✅ **User Authentication** - JWT tokens, secure passwords
✅ **Property Listings** - Create, edit (owner only), delete
✅ **Favorites** - Save properties to your account
✅ **Saved Searches** - Store search filters
✅ **Messaging** - Chat between buyers and sellers
✅ **Image Uploads** - Cloud storage with Cloudinary

## 📊 Check Your Data

Install MongoDB Compass to view your data visually:

1. Download: [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Browse `balkan-estate` database

## 🆘 Still Having Issues?

1. Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed setup
2. Check [backend/README.md](backend/README.md) for API documentation
3. Open an issue on GitHub

## 🎉 You're Ready!

Your Balkan Estate application is now fully integrated with:
- ✅ Real database (MongoDB)
- ✅ Secure authentication (JWT)
- ✅ Cloud image storage (Cloudinary)
- ✅ User ownership protection
- ✅ Persistent data storage

Happy coding! 🏡
