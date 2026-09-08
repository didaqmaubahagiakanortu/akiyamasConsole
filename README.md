# Akiyama Console - Backend API 🎮

A RESTful API backend for **Akiyama Console**, a game console and video game rental platform built with **NestJS**, **TypeScript**, and **Supabase** (PostgreSQL & Object Storage).

---

## 🚀 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js & TypeScript)
- **Database & Storage**: [Supabase](https://supabase.com/) (PostgreSQL & Storage Buckets)
- **Authentication**: JWT (JSON Web Tokens) & `@nestjs/jwt`
- **Password Hashing**: `bcrypt`
- **File Uploads**: `@nestjs/platform-express` (Multer) with Supabase Storage integration
- **Validation**: `class-validator` & `class-transformer`

---

## 🛠️ Project Setup

### 1. Installation

```bash
$ npm install
```

### 2. Environment Variables

Create a `.env` file in the root of `akiyama-backend/`:

```env
PORT=3000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SECRET_KEY=your-supabase-service-role-or-secret-key
JWT_SECRET=your-jwt-secret-key
```

---

## 🏃 Running the Application

```bash
# Development mode with hot reload
$ npm run start:dev

# Production build
$ npm run build

# Run production build
$ npm run start:prod
```

---

## 🔑 Authentication & Authorization

- **Authentication**: Include the JWT Bearer Token in the HTTP Authorization header:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Roles**: 
  - `USER`: Regular customer (create orders, upload payment proof, view personal orders & transactions).
  - `ADMIN`: Platform manager (manage consoles, games, verify/reject payments, view all orders & users).

---

## 📋 API Reference

Base URL: `http://localhost:3000` (or `{{LOCAL_URL}}`)

### 🔐 Authorization

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/login` | Public | Sign in with `email` and `password` to receive a JWT token. |

---

### 👤 Users (`/user`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/user` | Public | All | Register a new user account. |
| `GET` | `/user` | Bearer | Admin | Get list of users (supports `page`, `limit`, `name`, `email`, `city`, `role` query filters). |
| `GET` | `/user/me` | Bearer | User | Get current logged-in user's profile. |
| `GET` | `/user/:id` | Bearer | Admin | Get user details by ID. |
| `PATCH` | `/user/:id` | Bearer | Admin/User | Update user details (`phone_number`, `address`, `city`, `postal_code`, etc.). |
| `DELETE` | `/user/:id` | Bearer | Admin | Delete a user account. |

---

### 🕹️ Consoles (`/console`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/console` | Bearer | Admin | Add a new console (`name`, `brand`, `price`, `stock`). |
| `GET` | `/console` | Public | All | List all consoles (supports filtering by `name`, `brand`, `min_price`, `max_price`, `available`). |
| `GET` | `/console/:id` | Public | All | Get console details by ID (includes available games). |
| `PATCH` | `/console/:id` | Bearer | Admin | Update console info or stock. |
| `DELETE` | `/console/:id` | Bearer | Admin | Delete a console. |

---

### 🎮 Games (`/game`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/game` | Bearer | Admin | Create a new game with associated console platforms (`title`, `genre`, `platforms[]`). |
| `GET` | `/game` | Public | All | List games (filters: `title`, `platform`, `min_price`, `max_price`, `available`). |
| `GET` | `/game/:id` | Public | All | Get game details by ID with supported console platforms. |
| `PATCH` | `/game/:id` | Bearer | Admin | Update game info or console platform stock/pricing. |
| `DELETE` | `/game/:id` | Bearer | Admin | Delete a game. |

---

### 📦 Orders (`/order`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/order` | Bearer | User | Create a rental order (`start_date`, `end_date`, `shipping_address`, `items[]`). |
| `GET` | `/order` | Bearer | Admin | List all orders (filters: `user_name`, `status`, `page`, `limit`). |
| `GET` | `/order/me` | Bearer | User | Get current user's rental orders. |
| `GET` | `/order/:id` | Bearer | User/Admin | Get order details by ID. |
| `PATCH` | `/order/:id` | Bearer | User/Admin | Update order details. |
| `PATCH` | `/order/cancel/:id` | Bearer | User | Cancel an order and restore console/game stock. |
| `DELETE` | `/order/:id` | Bearer | Admin | Delete an order record. |

---

### 💳 Transactions & Payment Proof (`/transaction`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/transaction` | Bearer | User | Create a transaction for an order (`order_id`). |
| `GET` | `/transaction` | Bearer | Admin | List all transactions (filters: `status`, `notes`, `page`, `limit`). |
| `GET` | `/transaction/me` | Bearer | User | Get current user's transactions. |
| `GET` | `/transaction/:id` | Bearer | User/Admin | Get transaction details by ID. |
| `PATCH` | `/transaction/:id` | Bearer | Admin | Update transaction status or notes. |
| `PATCH` | `/transaction/:id/upload` | Bearer | User | **Upload Payment Proof** (`form-data` key `file` - supports PNG, JPG, WEBP up to 5MB). |
| `PATCH` | `/transaction/:id/verify` | Bearer | Admin | Verify payment proof and move order to `PROCESSING`. |
| `PATCH` | `/transaction/:id/reject` | Bearer | Admin | Reject payment proof and set transaction status to `REJECTED`. |
| `DELETE` | `/transaction/:id` | Bearer | Admin | Delete a transaction. |

---

## 📁 Supabase Storage Setup

- **Bucket Name**: `payment-proofs`
- **Access Level**: Public
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
- Used automatically by `/transaction/:id/upload` to store receipt images.

---

## 📄 License

This project is licensed under the MIT License.
