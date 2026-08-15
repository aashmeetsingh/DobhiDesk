# LaundryTrack backend

Node.js + Express + MongoDB API, matching the schema and endpoint design in the
project docs (`laundrytrack-mongodb-schema.md`, `laundrytrack-api-design.md`).

## 1. Set up MongoDB (no local server needed)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (M0 tier).
2. Under **Database Access**, create a user + password.
3. Under **Network Access**, allow your IP (or `0.0.0.0/0` while developing).
4. Copy the connection string from **Connect → Drivers**.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `MONGO_URI` — the Atlas connection string from step 1
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)
- `CLIENT_ORIGIN` — your React app's dev URL (e.g. `http://localhost:5173`)

## 3. Install and run

```bash
npm install
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

Server starts on `http://localhost:5000`. Check it's up:

```bash
curl http://localhost:5000/health
```

## 4. OTP login — dev mode

Until you plug in a real SMS provider, `POST /api/v1/auth/otp/send` logs the OTP
to your terminal instead of texting it (see `src/utils/sms.js`). Copy that code
into `POST /api/v1/auth/otp/verify` to log in during development.

## 5. Connecting your React frontend

- Base URL: `http://localhost:5000/api/v1`
- After OTP verify, store the returned `token` (e.g. in memory or `httpOnly` cookie —
  avoid `localStorage` for anything sensitive) and send it as
  `Authorization: Bearer <token>` on every other request.
- Full endpoint list and request/response shapes: see `laundrytrack-api-design.md`.

## Project structure

```
server.js              entry point
src/
  app.js                Express app, route mounting, CORS
  config/db.js           Mongo connection
  models/                 Mongoose schemas (Shop, Customer, Order, Payment)
  middleware/             auth (JWT check), error handler
  controllers/            route logic, one file per module
  routes/                 route definitions, one file per module
  utils/                  OTP store, SMS stub, tag generator
```

## Next steps / not yet wired up

- Real SMS provider (currently a console-log stub)
- Rate limiting on `/auth/otp/send` (prevent OTP spam)
- Input validation library (e.g. `zod` or `joi`) — currently minimal manual checks
- PDF report generation for `/reports/monthly` (CSV export is implemented; PDF is not)
