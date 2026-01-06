# Web News Project - Complete Guide

## 📋 Project Overview

This is a **full-stack web application** built with:
- **Frontend**: React + Vite + React Router
- **Backend**: Node.js + Express + MySQL
- **Authentication**: bcryptjs for password hashing + express-session for server-side sessions

## 🏗️ Project Structure

```
web_news/
├── client/              # Frontend (React)
│   ├── src/
│   │   ├── pages/       # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Single.jsx
│   │   │   └── Write.jsx
│   │   ├── components/  # Reusable components
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx      # Main app with routing
│   │   └── main.jsx     # Entry point
│   └── package.json
│
└── server/              # Backend (Express)
    ├── controllers/     # Business logic
    │   └── auth.js      # Authentication logic
    ├── routes/          # API routes
    │   └── auth.js      # Auth endpoints
    ├── db.js            # Database connection
    ├── index.js         # Server entry point
    ├── setup_database.js # Database setup script
    ├── check_database.js # Database inspection utility
    ├── database_setup.sql # SQL schema file
    └── package.json
```

## 🔄 How the Project Works - Sequence Flow

### 1. **Application Startup**

#### Backend (Server):
```
1. server/index.js starts Express server
2. Connects to MySQL database (db.js)
3. Sets up middleware (CORS, JSON parser, express-session)
4. Configures server-side sessions with cookies
5. Registers routes: /api/auth/*
6. Server listens on port 8800
```

#### Frontend (Client):
```
1. main.jsx renders App component
2. App.jsx sets up React Router
3. Router defines all routes (/, /login, /register, etc.)
4. Vite dev server runs on port 5173 (default)
```

### 2. **Login Feature Flow**

#### User Registration Flow:
```
User → Register Page → Form Submit
  ↓
POST /api/auth/register
  ↓
auth.js controller checks if user exists
  ↓
If new: Hash password → Insert into database
  ↓
Redirect to /login
```

#### User Login Flow:
```
User → Login Page → Enter credentials → Submit
  ↓
POST http://localhost:8800/api/auth/login
  ↓
Server: auth.js/login controller
  ├─ Query database for username
  ├─ Compare password with bcrypt
  ├─ Store user data in server session (cookie)
  └─ Return user data (without password)
  ↓
Client: Login.jsx receives response
  ├─ Save user to localStorage (for UI state)
  └─ Navigate to Home page (/)
  ↓
Navbar.jsx reads localStorage
  └─ Displays username and logout option
```

### 3. **Data Flow Diagram**

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │  HTTP   │   Express    │  SQL    │    MySQL    │
│  (React)    │◄───────►│   Server     │◄───────►│  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
     │                        │                        │
     │ 1. POST /api/auth/login│                        │
     │───────────────────────►│                        │
     │                        │ 2. SELECT * FROM users │
     │                        │───────────────────────►│
     │                        │                        │
     │                        │ 3. User data          │
     │                        │◄───────────────────────│
     │                        │                        │
     │ 4. {id, username, ...} │                        │
     │    Set session cookie  │                        │
     │◄───────────────────────│                        │
     │                        │                        │
     │ 5. Save to localStorage│                        │
     │    Navigate to /       │                        │
     │                        │                        │
```

## 🧪 How to Test the Login Feature

### Prerequisites Setup

1. **Install Dependencies:**
```bash
# Install server dependencies
cd web_news/server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Setup Database:**
   
   **Option A: Using the Setup Script (Recommended)**
   ```bash
   cd web_news/server
   # Create .env file with your MySQL credentials
   # For XAMPP (default port 3307, empty password):
   # DB_HOST=127.0.0.1
   # DB_PORT=3307
   # DB_USER=root
   # DB_PASSWORD=
   # DB_NAME=web_news
   
   # Run the setup script
   node setup_database.js
   ```
   
   **Option B: Manual Setup**
   - Create a `.env` file in `web_news/server/` with:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3307
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=web_news
   SESSION_SECRET=your-secret-key-change-in-production
   ```
   - For XAMPP users: `DB_PORT=3307` and `DB_PASSWORD=` (empty) by default
   - Run the SQL from `database_setup.sql` in your MySQL database

3. **Verify Database Setup:**
   ```bash
   cd web_news/server
   node check_database.js
   ```
   This will show you the database structure and existing users.

### Testing Steps

#### Step 1: Start the Backend Server
```bash
cd web_news/server
npm start
```
Expected output: `🚀 Server đang chạy tại http://localhost:8800`

#### Step 2: Start the Frontend Client
```bash
cd web_news/client
npm run dev
```
Expected output: `Local: http://localhost:5173`

#### Step 3: Test Registration
1. Open browser: `http://localhost:5173/register`
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Đăng Ký"
4. Should redirect to `/login`

#### Step 4: Test Login
1. On login page (`http://localhost:5173/login`)
2. Enter:
   - Username: `testuser`
   - Password: `password123`
3. Click "Đăng Nhập"
4. Should redirect to home page (`/`)
5. Check Navbar - should show username and "Đăng xuất" button

#### Step 5: Test Logout
1. Click "Đăng xuất" in Navbar
2. Should destroy server session and clear cookie
3. Should remove user from localStorage
4. Navbar should show "Đăng nhập" link again

#### Step 6: Test Current User Endpoint
1. After logging in, test: `GET http://localhost:8800/api/auth/current`
2. Should return current user data from server session
3. After logout, should return 401 (Unauthorized)

### Testing with Browser DevTools

1. **Open DevTools** (F12)
2. **Check Network Tab:**
   - Watch for POST requests to `/api/auth/login`
   - Check response status (200 = success, 400/404 = error)
3. **Check Application/Storage Tab:**
   - Look for `localStorage` → `user` key
   - Should contain JSON with user data after login
   - Look for Cookies → `connect.sid` (session cookie)
4. **Check Console:**
   - Look for any JavaScript errors
5. **Check Server Terminal:**
   - Should show: `✅ Đã kết nối MySQL thành công!`
   - Should show: `🚀 Server đang chạy tại http://localhost:8800`

### Manual API Testing (Optional)

You can test the API directly using:
- **Postman**
- **curl** command:
```bash
# Test Register
curl -X POST http://localhost:8800/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","email":"test2@example.com","password":"password123"}'

# Test Login
curl -X POST http://localhost:8800/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## ➕ How to Add New Features

### Pattern to Follow

The project follows a **3-layer architecture**:
1. **Route** (`routes/`) - Defines API endpoints
2. **Controller** (`controllers/`) - Business logic
3. **Database** (`db.js`) - Data access

### Example: Adding a "Posts" Feature

#### Step 1: Create Database Table
```sql
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### Step 2: Create Controller (`server/controllers/posts.js`)
```javascript
import { db } from "../db.js";

// Get all posts
export const getPosts = (req, res) => {
  const q = "SELECT * FROM posts";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json(data);
  });
};

// Create a post
export const createPost = (req, res) => {
  const q = "INSERT INTO posts(`title`, `content`, `author_id`) VALUES (?)";
  const values = [req.body.title, req.body.content, req.body.author_id];
  
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err);
    return res.status(200).json("Post created successfully!");
  });
};
```

#### Step 3: Create Routes (`server/routes/posts.js`)
```javascript
import express from "express";
import { getPosts, createPost } from "../controllers/posts.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", createPost);

export default router;
```

#### Step 4: Register Routes in `server/index.js`
```javascript
import postsRoutes from "./routes/posts.js";

// Add this line with other routes
app.use("/api/posts", postsRoutes);
```

#### Step 5: Create Frontend Page (`client/src/pages/Posts.jsx`)
```javascript
import React, { useState, useEffect } from "react";
import axios from "axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await axios.get("http://localhost:8800/api/posts");
      setPosts(res.data);
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <h1>All Posts</h1>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Posts;
```

#### Step 6: Add Route in `client/src/App.jsx`
```javascript
import Posts from "./pages/Posts";

// Add to router array
{
  path: "/posts",
  element: <Posts />,
}
```

### General Steps for Any New Feature

1. **Database**: Create table if needed
2. **Backend Controller**: Create `server/controllers/featureName.js`
3. **Backend Routes**: Create `server/routes/featureName.js`
4. **Register Routes**: Add to `server/index.js`
5. **Frontend Page**: Create `client/src/pages/FeatureName.jsx`
6. **Add Route**: Update `client/src/App.jsx`

## 🔑 Key Concepts

### Authentication Flow
- **Registration**: Password is hashed with bcrypt before storing
- **Login**: Password is compared with hashed version
- **Session**: User data stored in server-side session (cookie) + `localStorage` (for UI state)
- **Logout**: Destroys server session and clears cookie + removes data from `localStorage`
- **Current User**: Can be retrieved via `GET /api/auth/current` endpoint

### API Endpoints Structure
- Base URL: `http://localhost:8800/api`
- Root endpoint: `GET /` (returns API info)
- Auth endpoints: 
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user (creates session)
  - `POST /api/auth/logout` - Logout user (destroys session)
  - `GET /api/auth/current` - Get current logged-in user
- Pattern: `/api/{feature}/{action}`

### Frontend Routing
- Uses React Router v7
- Layout component wraps pages with Navbar/Footer
- Login/Register are outside Layout (no Navbar)

## 🛠️ Database Utilities

### Setup Database
```bash
cd web_news/server
node setup_database.js
```
Creates the `web_news` database and `users` table automatically.

### Check Database
```bash
cd web_news/server
node check_database.js
```
Shows:
- Database existence
- Table structure
- All users (without passwords)

## 🐛 Common Issues & Solutions

1. **Database Connection Error**
   - Check `.env` file exists and has correct credentials
   - Verify MySQL is running (XAMPP: check MySQL is started)
   - For XAMPP: Use port `3307` and empty password by default
   - Run `node setup_database.js` to create database if missing
   - Run `node check_database.js` to verify connection

2. **CORS Error**
   - Already handled in `server/index.js` with `cors()` middleware
   - Make sure frontend URL is in allowed origins list

3. **Port Already in Use**
   - Change PORT in `.env` or `server/index.js`
   - Kill process using port 8800: `taskkill /PID <process_id> /F` (Windows)
   - Or use: `netstat -ano | findstr :8800` to find the process

4. **Module Not Found**
   - Run `npm install` in both client and server folders
   - Make sure `express-session` is installed: `npm install express-session`

5. **Database Not Found Error**
   - Run `node setup_database.js` to create the database
   - Or manually create database: `CREATE DATABASE web_news;`

6. **Sass Deprecation Warnings**
   - Use `color.adjust()` instead of `darken()` function
   - Import: `@use "sass:color";` at top of SCSS file

## 📝 Next Steps

After understanding this structure, you can:
1. Add more features (Posts, Comments, Categories, etc.)
2. Add authentication middleware (JWT tokens)
3. Add file upload functionality
4. Add pagination for lists
5. Add search functionality
6. Style the pages with better CSS/SCSS

