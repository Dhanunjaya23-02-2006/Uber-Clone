# Uber Clone

A full-stack ride-hailing application with separate rider and captain experiences. Riders can request and track trips; captains can go online, accept nearby requests, verify pickup with an OTP, and complete rides with cash or manually verified UPI payments.

## Features

- Rider and captain registration, login, protected screens, and logout.
- Address search, route distance and duration, and fare estimates for auto, car, and motorcycle rides.
- Live ride dispatch and status updates with Socket.IO.
- Captain availability and location sharing, plus nearby ride notifications.
- Ride acceptance, OTP-based start, cancellation, and completion.
- Captain profile image, UPI details, completed-ride earnings, and online-time statistics.
- MongoDB persistence and OpenRouteService-backed geocoding and directions.

## Project layout

```text
backend/   Express API, MongoDB models, authentication, and Socket.IO
frontend/  React single-page application built with Vite
```

See the [backend README](backend/README.md) for environment variables and API/socket contracts, and the [frontend README](frontend/README.md) for client setup, routes, and scripts.

## Requirements

- Node.js and npm.
- A MongoDB database. A local MongoDB server or a MongoDB Atlas connection string will work.
- An OpenRouteService API key for geocoding and route calculations.

## Local development

### 1. Configure and start the backend

Create `backend/.env`:

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/uber-clone
JWT_SECRET=replace-with-a-long-random-secret
OPENROUTESERVICE_API_KEY=your-openrouteservice-api-key
FRONTEND_URL=http://localhost:5173
```

Install dependencies and start the API:

```powershell
cd backend
npm install
node server.js
```

The API and Socket.IO server listen on port `3000` by default. The root health/welcome endpoint is `GET http://localhost:3000/`.

### 2. Configure and start the frontend

Create `frontend/.env`:

```dotenv
VITE_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

Then install dependencies and start Vite:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Keep the backend running in a second terminal. If the frontend is served from a different origin, set the backend's `FRONTEND_URL` to that exact origin; multiple allowed origins can be provided through `FRONTEND_URLS` as comma-separated values.

Set both frontend URL variables to the backend origin. Most API requests use `VITE_BASE_URL`; the rider logout page currently reads `VITE_API_URL`.

## Main user flows

1. Open `/` and choose the rider or captain experience.
2. Register or log in as a rider, then enter pickup and destination addresses to view fare estimates and request a ride.
3. Register or log in as a captain, allow location access, and go online to receive ride offers near the pickup.
4. The captain accepts a request; the rider sees the assigned captain and provides the ride OTP at pickup.
5. After the trip, the captain records cash or confirms receipt of a manual UPI payment and completes the ride.

UPI QR payment is not verified by a payment gateway; the captain confirms payment receipt in the application.

## Useful commands

Run these from the indicated package directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm install` | Install backend dependencies |
| `backend/` | `node server.js` | Start API and Socket.IO |
| `frontend/` | `npm install` | Install frontend dependencies |
| `frontend/` | `npm run dev` | Start the Vite development server |
| `frontend/` | `npm run build` | Create the production frontend bundle |
| `frontend/` | `npm run preview` | Preview the production bundle |
| `frontend/` | `npm run lint` | Run ESLint |

The backend package currently has no automated test suite configured.
