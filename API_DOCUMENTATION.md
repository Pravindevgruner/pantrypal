# PantryPal - REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### Register User
- **POST** `/auth/register`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "customer@example.com",
    "password": "password123",
    "phone": "+91 9876543210",
    "role": "CUSTOMER" // "CUSTOMER" | "ADMIN" | "DELIVERY_PARTNER"
  }
  ```
- **Response**: `201 Created` with JWT `token` and `user` profile object.

### Login User
- **POST** `/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` with JWT `token` and `user` info.

### Get Profile
- **GET** `/auth/profile`
- **Auth**: Bearer Token (Any Role)

---

## 2. Category Endpoints (`/api/categories`)

### Get Categories
- **GET** `/categories`
- **Auth**: Public

### Create Category
- **POST** `/categories`
- **Auth**: Bearer Token (`ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Dairy & Eggs",
    "description": "Fresh milk and dairy products",
    "image": "https://images.unsplash.com/..."
  }
  ```

---

## 3. Product & Shelf Life Endpoints (`/api/products`)

### Get Products
- **GET** `/products?category={catId}&search={query}&sort={price_asc|price_desc}&page=1&limit=20`
- **Auth**: Public

### Create Product
- **POST** `/products`
- **Auth**: Bearer Token (`ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Fresh Toned Milk 1L",
    "category": "<categoryId>",
    "price": 64,
    "discountPrice": 60,
    "stockQuantity": 150,
    "unit": "pack",
    "weight": "1 L",
    "SKU": "MILK-TONED-1L",
    "shelfLifeDays": 5
  }
  ```

---

## 4. Smart Expiry Reminder System Endpoints (`/api/expiry`)

### Get Expiry Dashboard Items
- **GET** `/expiry`
- **Auth**: Bearer Token (`CUSTOMER`)
- **Response**: `200 OK` returns list of tracked customer grocery items with status (`FRESH`, `EXPIRING_SOON`, `EXPIRED`, `CONSUMED`, `DISCARDED`) and `daysRemaining` countdown.

### Mark Item Consumed
- **PUT** `/expiry/:id/consume`
- **Auth**: Bearer Token (`CUSTOMER`)
- **Request Body**: `{ "quantity": 1 }`

### Mark Item Discarded
- **PUT** `/expiry/:id/discard`
- **Auth**: Bearer Token (`CUSTOMER`)
- **Request Body**: `{ "quantity": 1 }`

### Trigger Background Expiry Engine (On-Demand)
- **POST** `/expiry/run-check`
- **Auth**: Bearer Token

---

## 5. Order Management Endpoints (`/api/orders`)

### Create Order
- **POST** `/orders`
- **Auth**: Bearer Token (`CUSTOMER`)
- **Request Body**:
  ```json
  {
    "addressId": "<addressId>",
    "paymentMethod": "UPI" // "UPI" | "CARD" | "NETBANKING" | "COD"
  }
  ```

### Update Order Status & Assign Delivery Agent
- **PUT** `/orders/:id/status`
- **Auth**: Bearer Token (`ADMIN`)
- **Request Body**:
  ```json
  {
    "status": "DELIVERED", // "CONFIRMED" | "ASSIGNED" | "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED"
    "deliveryPartnerId": "<partnerUserId>"
  }
  ```
- *Note: Updating status to `DELIVERED` automatically triggers creation of Smart Expiry records for the customer.*

---

## 6. Payment Endpoints (`/api/payments`)

### Create Razorpay Payment Order
- **POST** `/payments/create`
- **Auth**: Bearer Token (`CUSTOMER`)
- **Request Body**: `{ "amount": 233, "orderId": "<orderId>" }`

### Verify Razorpay Payment Signature
- **POST** `/payments/verify`
- **Auth**: Bearer Token (`CUSTOMER`)

---

## 7. Delivery Partner Endpoints (`/api/delivery`)

### Get Assigned Deliveries
- **GET** `/delivery/orders`
- **Auth**: Bearer Token (`DELIVERY_PARTNER`)

### Update Delivery Status Workflow
- **PUT** `/delivery/orders/:id/status`
- **Auth**: Bearer Token (`DELIVERY_PARTNER`)
- **Request Body**: `{ "status": "PICKED_UP" }` // "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED"
