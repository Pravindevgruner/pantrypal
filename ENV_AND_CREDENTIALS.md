# 🔐 PantryPal — Environment Variables & Credentials Reference Guide

This document contains the complete list of environment variables, default seeded accounts, and 3rd-party credentials required to configure and run all PantryPal components.

---

## 👥 1. Pre-Seeded Demo User Accounts

The database comes pre-seeded with 3 active role-based accounts (managed via `backend/seed.js`).

| Role | Email Address | Password | Phone Number | Default Access / Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password123` | `+91 9876543210` | Full administrative access: Products, Categories, Inventory adjustments, Delivery partner assignments, Analytics & Reports. |
| **Customer** | `customer@example.com` | `password123` | `+91 9876543211` | Customer app: Product browsing, Cart & Wishlist, Checkout & Razorpay, Order tracking, Household Pantry & Smart Expiry Engine. |
| **Delivery Partner** | `delivery@example.com` | `password123` | `+91 9876543212` | Delivery app: View assigned dispatches, Accept/Reject orders, Status progression (`ACCEPTED` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`), Earnings summary. |

> **Resetting Demo Data:**  
> Run `node seed.js` inside the `backend` directory anytime to reset the database and restore demo accounts, categories, and groceries.

---

## ⚙️ 2. Environment Variables by Application

### A. Backend API (`backend/.env`)

| Variable | Default / Development Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens. |
| `NODE_ENV` | `development` | Set to `production` in production environments. |
| `MONGODB_URI` | `mongodb://localhost:27017/pantrypal` | Local MongoDB or MongoDB Atlas URI (`mongodb+srv://...`). |
| `JWT_SECRET` | `pantrypal_super_secret_jwt_key_2026_dev_mode` | Secret key used to sign and verify JWT tokens. |
| `JWT_EXPIRE` | `30d` | Expiration duration for user sessions (e.g., `30d`, `7d`). |
| `API_BASE_URL` | `http://localhost:5000` | Public root URL for the backend server. |
| `RAZORPAY_KEY_ID` | `rzp_test_pantrypal123` | Razorpay Key ID for payments and order creation. |
| `RAZORPAY_KEY_SECRET` | `secret_test_pantrypal456` | Razorpay Key Secret for verifying webhook & HMAC signatures. |
| `RAZORPAY_WEBHOOK_SECRET` | `webhook_secret_789` | Secret for Razorpay payment webhooks. |
| `GOOGLE_MAPS_API_KEY` | `AIzaSyPantryPalDemoKeyForMaps123` | Google Maps API key for address geocoding and ETA calculation. |
| `FIREBASE_PROJECT_ID` | `pantrypal-dev` | Firebase Project ID. |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-pantrypal@pantrypal-dev.iam.gserviceaccount.com` | Firebase Admin SDK service account email. |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n..."` | Firebase Admin SDK private key for server-side push notifications. |
| `FIREBASE_SERVER_KEY` | `AAAA1234567890abcdef` | Firebase Cloud Messaging legacy server key. |

---

### B. Customer Web Application (`customer-app/.env`)

| Variable | Default / Development Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API URL. In production, set to your production API domain. |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_pantrypal123` | Public Razorpay Key ID used by the client-side checkout modal. |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyPantryPalDemoKeyForMaps123` | Google Maps JS API key for address auto-complete and pin drop. |

---

### C. Delivery Partner Web Application (`delivery-app/.env`)

| Variable | Default / Development Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API URL for driver login, order assignments, and status updates. |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyPantryPalDemoKeyForMaps123` | Google Maps JS API key for delivery navigation and route rendering. |

---

### D. Admin Web Panel (`admin-panel/.env`)

| Variable | Default / Development Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Backend API URL for managing products, categories, inventory, and users. |

---

### E. React Native Mobile App (`mobile-app/`)

| Parameter / Config | Location | Default Value | Notes |
| :--- | :--- | :--- | :--- |
| `BASE_URL` | `src/services/api.js` | `http://10.0.2.2:5000/api` (Android)<br>`http://localhost:5000/api` (iOS) | `10.0.2.2` automatically routes to host machine `localhost` on Android Emulator. Alternatively run `adb reverse tcp:5000 tcp:5000`. For physical devices on Wi-Fi, set to your host computer's LAN IP (e.g. `http://192.168.1.50:5000/api`). |
| `GOOGLE_MAPS_API_KEY` | `android/app/src/main/AndroidManifest.xml` | `AIzaSyPantryPalDemoKeyForMaps123` | Under `<meta-data android:name="com.google.android.geo.API_KEY" android:value="..." />`. |
| `google-services.json` | `android/app/google-services.json` | Firebase configuration file | Required when deploying production FCM push notifications on Android. |

---

## 🔑 3. Third-Party Service Setup Instructions

### 1. MongoDB Atlas (Cloud Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free cluster (M0 sandbox).
3. Create a database user with read/write permissions.
4. Under **Network Access**, whitelist your IP address or allow `0.0.0.0/0`.
5. Copy the connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pantrypal?retryWrites=true&w=majority
   ```

### 2. Razorpay (Payment Gateway)
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings → API Keys**.
3. Generate **Test Keys** (`Key Id` begins with `rzp_test_`).
4. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`.
5. Set `VITE_RAZORPAY_KEY_ID` in `customer-app/.env`.

### 3. Firebase (Push Notifications & FCM)
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Project Settings → Service accounts**.
3. Click **Generate new private key** to download the JSON service account.
4. Extract `project_id`, `client_email`, and `private_key` into `backend/.env`.
5. For Android: Add an Android App with package name `com.pantrypal`, download `google-services.json`, and place it in `mobile-app/android/app/`.

### 4. Google Maps Platform
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Enable:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Distance Matrix API**
   - **Maps SDK for Android**
3. Create an API Key under **Credentials**.
4. Set `GOOGLE_MAPS_API_KEY` in `backend/.env` and `VITE_GOOGLE_MAPS_API_KEY` in frontend `.env` files.
