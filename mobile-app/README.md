# PantryPal Mobile Application (React Native Android)

A complete, production-ready React Native application for **PantryPal: Smart Grocery Delivery & Smart Expiry Reminder System**.

## Features Included
1. **Customer Grocery Shopping Flow**:
   - Live Product Browsing, Categories filtering, and Search
   - Real-time Product Details with **Smart Expiry Forecast Widget** (Estimated expiry date countdown, shelf-life indicator, perishability risk, and storage guide)
   - Shopping Basket & Cart with free delivery progress calculation
   - Multi-step Checkout with delivery address picker, delivery slots, and payment methods (Razorpay, UPI, COD)
   - Order confirmation & real-time tracking timeline (Placed -> Confirmed -> Out for Delivery -> Delivered)
2. **Smart Expiry Reminder System**:
   - Automated tracking of purchased groceries
   - Live Days-remaining countdown badges (Fresh, Expiring Soon, Expired)
   - Freshness progress bar visualization
   - Immediate "Run Expiry Scan" trigger button to simulate background expiry jobs
   - "Mark Consumed" and "Mark Discarded" lifecycle actions
3. **Household Grocery Pantry**:
   - Manage household grocery inventory in kitchen zones (**Fridge**, **Pantry**, **Freezer**)
   - Add custom items with shelf life days and preset quick-picks (Organic Milk, Eggs, Sourdough Bread, Bananas, etc.)
   - Direct "+ Add to Household Pantry" CTA right from product details
4. **Delivery Partner Portal**:
   - View assigned orders
   - Customer address, telephone, and delivery slot details
   - One-tap status updates (`CONFIRMED` -> `OUT_FOR_DELIVERY` -> `DELIVERED`)
5. **Instant 1-Tap Demo Switcher**:
   - Switch between **Customer**, **Delivery Partner**, and **Admin** accounts with 1 tap for rapid evaluation

---

## Running the Application

### 1. Prerequisites
- **Node.js** >= 18
- **Android Studio** (with Android SDK platform 34 and Android Virtual Device / Emulator)
- **Backend Running**: The PantryPal backend should be running on port 5000 (`cd ../backend && npm run dev` or `node src/app.js`)

> **Note on Emulator Network Mapping**:
> Android Emulators access the host machine's `localhost` via `http://10.0.2.2:5000/api`. This is pre-configured in `src/services/api.js`. If you test on a physical Android device over Wi-Fi, change `BASE_URL` to your machine's local IP (e.g. `http://192.168.1.50:5000/api`).

### 2. Install Dependencies
```bash
cd mobile-app
npm install
```

### 3. Run in Android Studio
1. Launch **Android Studio**.
2. Select **Open** and choose the `pantrypal/mobile-app/android` directory.
3. Allow Gradle to sync dependencies.
4. Launch your Android Virtual Device (AVD Emulator).
5. Click the green **Run** button (or run `npm run android` in your terminal).

### 4. Run via Command Line
```bash
# Start Metro bundler:
npm start

# In a new terminal, build & launch Android app:
npm run android
```

---

## Seed Accounts for Testing
- **Customer**: `customer@example.com` / `Password123!`
- **Delivery Partner**: `delivery@example.com` / `Password123!`
- **Admin**: `admin@example.com` / `Password123!`
