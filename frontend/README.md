# 🩸 Blood Donation App – Frontend

## 🚀 Overview

This is the frontend of the Blood Donation & SOS system. It allows users (donors & hospitals) to register, login, search for nearby donors, and send emergency SOS alerts.

Built using **React (Vite)** for fast performance and modern UI.

---

## 🛠️ Tech Stack

* React (Vite)
* Axios
* React Router DOM
* CSS (basic styling)

---

## 📂 Project Structure

```
src/
│
├── api/           # Axios configuration
├── pages/         # All pages (Login, Register, Dashboard, etc.)
├── App.jsx        # Routing
└── main.jsx       # Entry point
```

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```
npm install
```

### 2. Run development server

```
npm run dev
```

### 3. Open in browser

```
http://localhost:5173
```

---

## 🔗 Backend Connection

Make sure backend is running at:

```
http://localhost:5000
```

Axios is configured in:

```
src/api/axios.js
```

---

## 🔐 Features

### 👤 Authentication

* User registration (Donor / Hospital)
* Login with JWT token
* Token stored in localStorage

---

### 🩸 Donor Features

* Register as donor
* View nearby requests

---

### 🏥 Hospital Features

* Search donors by blood group
* View nearest donors (sorted by distance)
* Send SOS alerts 🚨

---

## 📍 API Endpoints Used

* POST `/api/auth/register`
* POST `/api/auth/login`
* GET `/api/request/donors`
* POST `/api/request/sos`

---

## ⚠️ Notes

* Location must be provided (latitude & longitude)
* JWT token is required for protected routes
* Backend must be running before frontend

---

## 🚀 Future Improvements

* UI/UX enhancements
* Google Maps integration
* Auto location detection
* Notifications system
* Mobile responsiveness