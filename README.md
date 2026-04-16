# 🦓 Zoo Management System

A comprehensive, full-stack solution for managing zoo operations, visitor engagement, and animal welfare. This project features a robust **Node.js REST API** and a modern **React Native (Expo)** mobile application.

---

## 🏗️ System Architecture

The system is built with a decoupled architecture to ensure scalability and ease of deployment:

- **Mobile Client**: Built with **Expo SDK 54**, featuring a rich, glassmorphism-inspired UI for visitors and staff.
- **Backend API**: A **Node.js & Express** server providing secure RESTful endpoints.
- **Database**: **MongoDB Atlas** for high-availability cloud data storage.
- **Security**: **JWT-based** authentication with role-based access control (Admin/Visitor).

---

## 🚀 Key Features

### 🔐 Authentication & Profile
- Secure Register/Login for Visitors and Admin.
- Profile management and role-based dashboard redirection.

### 🦁 Zoo Management (Phase 1 & 2)
- **Animal Catalog**: Comprehensive database of zoo inhabitants.
- **Events & Encounters**: Scheduling and managing live shows and animal sessions.
- **Virtual Store**: Merchandise and souvenir management.
- **Ticketing & Shows**: Digital ticket booking and show schedule tracking.
- **Visitor Feedback**: Real-time feedback loop for continuous improvement.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React Native, Expo SDK 54, React Navigation v6, Axios, Expo Blur, Lucide Icons |
| **Backend** | Node.js, Express, Mongoose, JWT, Helmet, Morgan, Multer |
| **Database** | MongoDB Atlas (NoSQL) |
| **DevOps** | npm |

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/expo-go) app installed on your phone (for physical device testing).

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env based on the provided keys below
npm run dev
```

**Backend `.env` Configuration:**
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_strong_secret
PORT=5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Create .env based on the provided keys below
npm run start
```

**Frontend `.env` Configuration:**
```env
# Use your computer's LAN IP or a tunnel URL
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5000/api
```

---

## 📱 Testing on Physical Devices

This project uses **port 8085** for Metro to avoid conflicts with other tools.

On the **same Wi‑Fi** as your PC, set `EXPO_PUBLIC_API_URL` in `frontend/.env` to `http://YOUR_PC_LAN_IP:5000/api` (use the port shown in the backend terminal if it is not 5000). Allow **Node.js** through Windows Firewall on private networks if the phone cannot connect.

If your network blocks device-to-device traffic, use **ngrok** (or similar) on the API port and set `EXPO_PUBLIC_API_URL` to that HTTPS URL + `/api`, then start Metro (`npm run start` or `npm run start:tunnel` as needed).

---

## 📂 Project Structure

```text
Zoo-Management/
├── backend/            # Express API & MongoDB Models
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── models/
├── frontend/           # React Native (Expo) Application
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   └── context/    # State management
│   └── assets/         # App icons and images
└── README.md           # Main documentation (You are here)
```

---

## 📝 Roadmap
- [x] Phase 1: Authentication, Core Navigation, UI Shell.
- [/] Phase 2: Live Feature APIs, Image Uploads, Real-time Feedback.
- [ ] Phase 3: Analytics Dashboard, Push Notifications.

---

**Developed for the Zoo Visitor & Management System.**