# 🩸 Blood Donation Backend API

A simple and powerful backend system for managing blood donors, hospitals, and emergency SOS alerts based on location.

---

## 🚀 Features

### 🔐 Authentication

* User Registration (Donor / Hospital)
* Login with JWT
* Role-based access control

---

### 🩸 Donor Management

* Store donor details (blood group, phone, location)
* Eligibility check (90 days gap between donations)

---

### 📍 Location-Based Search

* Find donors within **30 km radius**
* Uses **MongoDB GeoSpatial (2dsphere)**
* Sorted by **nearest donors first**

---

### 🚨 SOS Alert System

* Hospital can trigger SOS request
* Finds nearest eligible donors
* Sends SMS alerts (mock / real Twilio)

---

## 📁 Project Structure

```
backend/
 ├── models/
 │     └── User.js
 ├── routes/
 │     ├── authRoutes.js
 │     └── requestRoutes.js
 ├── middleware/
 │     └── authMiddleware.js
 ├── utils/
 │     └── sendSMS.js
 ├── .env
 ├── server.js
```

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Twilio (for SMS)

---

## 🔧 Installation

```bash
git clone <your-repo-url>
cd backend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

# Optional (for real SMS)
TWILIO_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=your_twilio_number
```

---

## ▶️ Run Server

```bash
npm run dev
```

or

```bash
nodemon server.js
```

---

## 📡 API Endpoints

---

### 🔹 1. Register User

```
POST /api/auth/register
```

```json
{
  "name": "Rahul",
  "email": "rahul@gmail.com",
  "password": "123456",
  "role": "donor",
  "bloodGroup": "A+",
  "phone": "9876543210",
  "location": {
    "type": "Point",
    "coordinates": [72.8777, 19.0760]
  }
}
```

---

### 🔹 2. Login

```
POST /api/auth/login
```

---

### 🔹 3. Get Nearby Donors

```
GET /api/request/donors?bloodGroup=A%2B&lat=19.0760&lng=72.8777
```

Headers:

```
Authorization: Bearer TOKEN
```

---

### 🔹 4. SOS Alert 🚨

```
POST /api/request/sos
```

```json
{
  "bloodGroup": "A+",
  "lat": 19.0760,
  "lng": 72.8777
}
```

---

## 🧠 How It Works

1. Hospital sends SOS request
2. Backend performs geo-search within 30km
3. Filters eligible donors (≥ 90 days)
4. Sorts nearest donors first
5. Sends SMS alerts to top donors

---

## 🧪 SMS Modes

### ✅ Mock Mode (Default)

Logs messages in terminal:

```
🚨 SMS MOCK:
To: 9876543210
Message: URGENT blood needed
```

---

### 📱 Real SMS (Twilio)

Enable by adding credentials in `.env`

---

## ⚠️ Important Notes

* Location must be in GeoJSON format:

```
coordinates: [longitude, latitude]
```

* MongoDB requires `2dsphere` index for geo queries

---

## 📈 Future Improvements

* Google Maps integration
* Real-time notifications
* Donor dashboard
* Admin panel
* Push notifications (Firebase)