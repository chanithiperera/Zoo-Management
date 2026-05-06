# 🦓 Zoo & Visitor Management System

[![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A premium, full-stack digital solution designed to revolutionize zoo operations and visitor experiences. This system seamlessly integrates an **Express-powered REST API** with a modern **React Native (Expo)** mobile application, featuring a cutting-edge Glassmorphism design system.

---

## 🌟 Core Modules

### 📱 Visitor Experience
- **Animal Encyclopedia**: Explore detailed information about zoo inhabitants with rich media.
- **Animal Encounters**: Real-time schedules for live feeding, photo sessions, and educational talks.
- **Smart Ticketing**: Digital ticket purchasing and QR-code based entry system.
- **Online Store**: Browse and purchase souvenirs, merchandise, and food with a seamless cart experience.
- **Interactive Feedback**: A dedicated inquiry system for visitors to ask questions and provide suggestions.

### 🛡️ Admin Management
- **Dashboard Analytics**: Overview of sales, visitor traffic, and animal welfare status.
- **Store & Inventory**: Comprehensive tool for managing product stock, categories, and order fulfillment.
- **Encounter Management**: Schedule and manage staff-animal interactions.
- **Inquiry Handling**: Centralized system for responding to visitor feedback and issues.
- **Media Management**: Automated image hosting and optimization via Cloudinary.

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation v6 (Native Stack)
- **Styling**: Glassmorphism UI, Expo Blur, Lucide Icons
- **State Management**: React Context API
- **Networking**: Axios with custom API client

### Backend (REST API)
- **Runtime**: Node.js & Express
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt encryption
- **File Handling**: Multer & Cloudinary (Cloud-based asset management)
- **Security**: Helmet.js, CORS, and Express Validator

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Expo Go** app (for physical device testing)
- A **Cloudinary** account (for image uploads)
- A **MongoDB Atlas** cluster

### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
# Copy .env.example to .env and fill in your credentials
npm run dev
```

**Required `.env` Variables (Backend):**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Metro bundler
npx expo start --port 8085
```

**Required `.env` Variables (Frontend):**
```env
# Replace with your local IP for physical device testing
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api
```

---

## 🎨 Design Philosophy
The application follows a **Modern Premium** aesthetic:
- **Glassmorphism**: Translucent backgrounds and subtle blurs for a futuristic feel.
- **Micro-animations**: Smooth transitions and interactive feedback using `Animated`.
- **Custom UI Components**: Reusable `StatusModal`, `Card`, and `Button` components ensuring consistency.
- **Responsive Layouts**: Optimized for both iOS and Android devices.

---

## 📂 Project Structure
```text
Zoo-Management/
├── backend/                # Express.js Server
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB Schemas
│   │   ├── routes/         # API Endpoints
│   │   ├── middleware/     # Auth & Upload logic
│   │   └── config/         # DB & Cloudinary config
├── frontend/               # React Native App
│   ├── src/
│   │   ├── screens/        # Screen components
│   │   ├── navigation/     # App routing
│   │   ├── components/     # UI Design System
│   │   └── context/        # Global state
│   └── assets/             # Images & Icons
└── README.md
```

---

## 👨‍💻 Development Team
Group Number: WMT-DS-14

Member 1: IT24400067 – Perera M.C.D – Ticket & Show Booking Management   
Member 2: IT24103181 – Gayathmika M.G.H – Event Management
Member 3: IT24100069 – Indeepa M.G.P.J – Feedback, Inquiry & Review Management   
Member 4: IT24102399 – Pamithu Dulwan H.G – Animal Information & Education Management
Member 5: IT24103582 – Tharindu K.T.D.S – Animal Encounter & Photography Management
Member 6: IT24102546 – Abeygunasekera P – Online Store Management  
 
