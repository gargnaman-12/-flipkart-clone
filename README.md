# Flipkart Clone (MERN)

A Flipkart-style full-stack clone (FlipkartX) with:
- React frontend (`client`)
- Express + MongoDB Atlas backend (`server`)
- Product rails, category filters, product details, reviews, and interactive cart

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB Atlas connection string

## 1) Clone

```bash
git clone https://github.com/gargnaman-12/-flipkart-clone.git
cd -flipkart-clone
```

## 2) Backend setup

```bash
cd server
npm install
```

Create `.env` in `server/` from `.env.example`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
PORT=5000
```

Run backend:

```bash
npm run dev
```

Expected logs:
- `MongoDB connected`
- `Server running on http://localhost:5000`

## 3) Seed products

In another terminal:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/products/seed?force=true"
```

## 4) Frontend setup

```bash
cd client
npm install
npm start
```

App runs at: `http://localhost:3000`

## API quick check

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/products?limit=3" | ConvertTo-Json -Depth 4
```

## Troubleshooting

- `EADDRINUSE: 5000` -> another process is on port 5000. Stop it and rerun backend.
- `Unable to connect to remote server` while seeding -> backend is not running.
- No products on UI -> run seed endpoint once and hard refresh frontend (`Ctrl + F5`).
- Mongo connection error -> verify Atlas URI and IP/network access in Atlas.
