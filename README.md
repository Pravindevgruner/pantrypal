# 🛒 PantryPal: Smart Grocery Delivery & Smart Expiry Reminder System

> A production-ready, full-stack monorepo application featuring **Customer App**, **Delivery Partner App**, **Admin Web Panel**, and a **Node.js/MongoDB REST API Backend** equipped with an automated **Smart Expiry Engine**.

---

## 🌟 Key Features

### 1. Smart Expiry Reminder Engine (Core Feature)
- **Automatic Purchase Tracking**: Syncs purchased groceries directly into the customer's Smart Expiry database upon order delivery.
- **Shelf Life Formula**: Dynamically computes item expiration (`expiryDate = purchaseDate + product.shelfLifeDays`).
- **Automated Background Job (Node Cron)**: Daily midnight scheduled scan calculating days remaining, updating item status (`FRESH`, `EXPIRING_SOON`, `EXPIRED`), and dispatching notifications at 7-day, 3-day, 1-day, and 0-day thresholds without duplicates.
- **Consumption & Waste Management**: Allows customers to record consumed/discarded quantities and tracks household food waste reduction insights.

### 2. Customer Application (`:3000`)
- **Modern Grocery UI**: Search, category filters, promotional carousel, wishlist toggle, stock validation.
- **Smart Expiry Dashboard**: Dedicated screen with Fresh, Expiring Soon, Expired tabs and countdown badges.
- **Multi-step Checkout**: Address selection modal, Razorpay payment flow (Card, UPI, COD).
- **Live Order Tracking**: Interactive step-by-step delivery timeline stepper and invoice details.

### 3. Delivery Partner Application (`:3001`)
- **Driver Dashboard**: Active assigned queue, today's completed deliveries, earnings summary (₹45/order payout log).
- **Delivery Workflow**: Pickup at fulfillment store -> Out for delivery -> Handover verification & map route navigation.

### 4. Admin Management Panel (`:3002`)
- **Operations Dashboard**: Live sales revenue metrics, pending orders count, low-stock warnings, and expiring product alerts.
- **Product & Shelf-Life Configuration**: Configure product prices, discounts, stock, SKU, and shelf life (in days).
- **Order Management**: Assign available delivery partners, update order statuses, monitor logistics.
- **Reports & Analytics**: Global food wastage reports and sales analytics.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth, Node Cron, Razorpay SDK.
- **Customer App**: React.js / React Native Web, React Router v6, TailwindCSS, Lucide Icons.
- **Delivery App**: React.js / React Native Web, TailwindCSS, Lucide Icons.
- **Admin Panel**: React.js Web UI, TailwindCSS.

---

## 📁 Repository Structure

```
pantrypal/
├── backend/            # Express REST API, MongoDB Models, Expiry Cron Engine, Seeders
├── customer-app/       # Customer Mobile/Web Application (Port 3000)
├── delivery-app/       # Delivery Partner Mobile/Web Application (Port 3001)
├── admin-panel/        # Admin Management Web Panel (Port 3002)
├── API_DOCUMENTATION.md
└── README.md
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password123` |
| **Customer** | `customer@example.com` | `password123` |
| **Delivery Partner** | `delivery@example.com` | `password123` |

---

## 🚀 Getting Started

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```

### 2. Launch Backend Server & Auto-Seed Database
```bash
npm run start:backend
```
*The backend will automatically start an in-memory MongoDB server if local MongoDB is not running, and seed realistic demo products, categories, orders, and expiry logs.*

### 3. Launch Applications
Open separate terminal tabs:

- **Customer App**: `npm run start:customer` (Runs on `http://localhost:3000`)
- **Delivery Partner App**: `npm run start:delivery` (Runs on `http://localhost:3001`)
- **Admin Web Panel**: `npm run start:admin` (Runs on `http://localhost:3002`)

---

## 🧪 Testing the End-to-End Smart Expiry Workflow

1. Open **Customer App** (`http://localhost:3000`) -> Log in as `customer@example.com`.
2. Add fresh items (Milk: 5d shelf life, Bread: 7d shelf life) to cart -> Complete Checkout.
3. Open **Admin Panel** (`http://localhost:3002`) -> Log in as `admin@example.com` -> Go to **Orders** -> Assign `Delivery Partner User` -> Mark status to **DELIVERED**.
4. Open **Customer App** -> Navigate to **Smart Expiry Dashboard** -> Verify items appear under **Fresh** / **Expiring Soon** with countdown timers -> Test marking items as consumed/discarded!
