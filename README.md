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
| **DevOps** | pnpm, LocalTunnel, patch-package |

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) (Mandatory)
- [Expo Go](https://expo.dev/expo-go) app installed on your phone.

### 1. Backend Setup
```bash
cd backend
pnpm install
# Create .env based on the provided keys below
pnpm run dev
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
pnpm install
# Create .env based on the provided keys below
pnpm run start
```

**Frontend `.env` Configuration:**
```env
# Use your computer's LAN IP or a tunnel URL
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5000/api
```

---

## 📱 Testing on Physical Devices

This project uses **Port 8085** for Metro to avoid conflicts.

### Step A: Tunnel the API
Since your phone needs to reach your local API, run the tunnel from the `backend` folder:
```bash
pnpm run tunnel
```
*Note the URL provided (e.g., `https://XXXX.loca.lt`).*

### Step B: Update Frontend Environment
1. In `frontend/.env`, set `EXPO_PUBLIC_API_URL` to the tunnel URL + `/api`.
2. Start the Metro bundler with a tunnel:
```bash
pnpm run start:tunnel -c
```

---

## 📂 Project Structure

```text
Zoo-Management/
├── backend/            # Express API & MongoDB Models
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── models/
│   └── scripts/        # Utility scripts (tunnel, etc.)
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