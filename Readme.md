# 🩸 Blood Donation & SOS System (LifeLink / RedRescue)

## 🚀 Overview

A full-stack web application that connects blood donors with hospitals in real-time. It allows hospitals to find nearby donors and send SOS alerts during emergencies.

---

## 🌟 Key Features

### 🔐 Authentication

* JWT-based login & registration
* Role-based access (Donor / Hospital)

---

### 🩸 Donor System

* Register as donor
* Store blood group & location
* Available for emergency requests

---

### 📍 Location-Based Search

* Find donors within 30 km radius
* Uses MongoDB GeoJSON (2dsphere)
* Sorted by nearest distance

---

### 🚨 SOS Alert System

* Hospitals can send emergency alerts
* SMS (mock / Twilio integration)
* Notifies nearby donors instantly

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication

### Other

* Twilio (for SMS, optional)
* GeoSpatial Queries (MongoDB)

---

## 📂 Project Structure

```
trial1/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   └── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone <repo-url>
cd project-folder
```

---

## 🔧 Backend Setup

```
cd backend
npm install
```

### Create `.env`

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### Run backend

```
nodemon server.js
```

---

## 💻 Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

### Donor Search

* GET `/api/request/donors?bloodGroup=A+&lat=xx&lng=xx`

### SOS

* POST `/api/request/sos`

---

## 📍 Geo Location Format

```
location: {
  type: "Point",
  coordinates: [longitude, latitude]
}
```

---

## 🔐 Security

* Password hashing using bcrypt
* JWT-based authentication
* Protected routes

---

## 🚀 Future Enhancements

* Live tracking with maps 🗺️
* Push notifications 🔔
* Real SMS integration 📲
* Admin dashboard
* AI-based donor matching

---

## 🧠 Use Cases

* Emergency blood requirement
* Hospital donor search
* Real-time donor alerts

## ❤️ Mission

Saving lives by connecting donors and hospitals faster.