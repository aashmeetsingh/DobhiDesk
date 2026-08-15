# DhobiDesk

A mobile app for laundry shop owners to digitize order tracking, customer management, and payment records — replacing manual registers with a real-time operations dashboard.

Built as part of a technical internship at Talking Crooks IT Pvt. Ltd.

---

## Overview

DhobiDesk lets a laundry/dhobi shop owner:

- Log in via phone number + OTP (no passwords)
- Create and track orders through their full lifecycle (picked up → washing → ironing → ready → delivered)
- Manage customer profiles, order history, service preferences, and addresses
- Record payments (cash/UPI/card) and track balances per order
- View an operations dashboard with live stats — orders this week, revenue this month, overdue pickups, completed orders
- Export order reports as PDF or CSV

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Mobile frontend | React Native (Expo, Expo Router) | Fast cross-platform build, file-based routing, no native build setup needed during development |
| Backend | Node.js + Express | Lightweight REST API layer, JavaScript across the whole stack |
| Database | MongoDB (Atlas or local) | Flexible document model for order/item data; no server setup needed with Atlas's free tier |
| Auth | JWT + phone OTP | Passwordless login suited to a mobile-first, non-technical user base |
| PDF generation | pdfkit | Server-side report generation without a headless browser |

---

## Project structure

```
DobhiDesk/
├── backend/                    Node.js + Express + MongoDB API
│   ├── server.js                entry point
│   ├── src/
│   │   ├── app.js                Express app, CORS, route mounting
│   │   ├── config/db.js           MongoDB connection
│   │   ├── models/                 Mongoose schemas (Shop, Customer, Order, Payment)
│   │   ├── middleware/              JWT auth, error handler
│   │   ├── controllers/              route logic, one file per module
│   │   ├── routes/                   route definitions, one file per module
│   │   └── utils/                     OTP store, SMS stub, tag generator
│   └── .env.example
│
└── app/ (or wherever the Expo project root is)
    ├── lib/api.ts                Shared API client (auth, orders, customers)
    ├── app/(tabs)/index.tsx       Dashboard
    ├── app/(tabs)/orders.tsx      Order list, search, filters, export
    ├── app/(tabs)/customers.tsx   Customer list
    ├── app/customers/[id].tsx     Customer profile
    ├── app/neworder.tsx           Order creation form
    ├── app/login.tsx              Phone entry
    └── app/otp.tsx                OTP verification
```

---

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Fill in `.env`:
- `MONGO_URI` — a MongoDB Atlas connection string (free M0 tier), including a database name, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dhobidesk`
- `JWT_SECRET` — any long random string, e.g. generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `CLIENT_ORIGIN` — not required for the mobile app (CORS only applies to browsers), leave as default

```bash
npm run dev
```

Server runs on `http://localhost:5000`. Confirm with `curl http://localhost:5000/health`.

### 2. Frontend

In `lib/api.ts`, set `API_BASE_URL` to your machine's LAN IP (not `localhost` — a physical device or emulator can't resolve that back to your dev machine), e.g. `http://192.168.1.38:5000/api/v1`.

```bash
npx expo install expo-secure-store expo-file-system expo-sharing
npm install
npx expo start
```

Scan the QR code with Expo Go, or run on a simulator/emulator.

### 3. Try it end-to-end

1. Enter a shop name and phone number on the login screen → Send OTP
2. In dev mode, the OTP prints to the **backend terminal** (no SMS provider configured yet)
3. Enter the OTP to log in — this creates the shop record in MongoDB
4. Create a test order from the dashboard
5. Confirm it appears in the Orders list and dashboard stats update

---

## Features implemented

- Phone + OTP authentication with JWT sessions
- Order creation with multiple line items, service type, and scheduling
- Order lifecycle tracking (stage-by-stage progression)
- Order search and status filtering
- Customer profiles with order history, preferences, and editable address
- Payment recording with automatic balance calculation (MongoDB transactions keep payment writes and order balances consistent)
- Live dashboard stats (orders this week, revenue this month, overdue, completed)
- PDF and CSV export of the order report

## Not yet implemented / out of scope for this submission

- Real SMS provider for OTP (currently logs to the server console for development)
- Customer-facing app or portal (this build is shop-owner/operator-only)
- Automated notifications to customers on order stage changes
- Multi-branch/franchise support
- Online payment gateway integration (payments are recorded, not processed, in this build)
- Pagination beyond the first page of results in the Orders list

---
