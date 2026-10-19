# Backend

Express REST API and Socket.IO server for the Uber Clone rider and captain applications. The server uses MongoDB for accounts, rides, and token revocation, and OpenRouteService for address and route lookups.

## Requirements

- Node.js and npm.
- A reachable MongoDB instance.
- An OpenRouteService API key.

## Setup

Create `backend/.env`:

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/uber-clone
JWT_SECRET=replace-with-a-long-random-secret
OPENROUTESERVICE_API_KEY=your-openrouteservice-api-key
FRONTEND_URL=http://localhost:5173
```

`PORT` is optional and defaults to `3000`. `FRONTEND_URL` defaults to `http://localhost:5173`; `FRONTEND_URLS` can be used to allow additional comma-separated origins. In non-production environments, HTTPS `*.devtunnels.ms` origins are also allowed. Do not commit `.env` or real credentials.

Install and run from this directory:

```powershell
npm install
node server.js
```

The HTTP API and Socket.IO server share the same port. `GET /` returns `Welcome to uber clone`. MongoDB must be available before using API features.

## Authentication

Protected REST endpoints accept the JWT returned by registration or login. Send it as a bearer token:

```http
Authorization: Bearer <token>
```

The API also accepts a `token` cookie. Tokens expire after 24 hours. Logout blacklists the current token; an expired, missing, invalid, or blacklisted token receives `401 Unauthorized`.

Requests with JSON bodies should use `Content-Type: application/json`. Validation failures generally return `400` with an `errors` array; other failures may return a JSON `message`.

## REST API

The route paths below are relative to the server origin, for example `http://localhost:3000`.

### Users

| Method and path | Auth | Purpose and inputs |
| --- | --- | --- |
| `POST /users/register` | No | Register with `fullname.firstname` (minimum 3 chars), optional `fullname.lastname` (minimum 3 if supplied), valid `email`, and `password` (minimum 6 chars). Returns `201` with `user` and `token`. |
| `POST /users/login` | No | Authenticate with `email` and `password`. Returns `user` and `token`; also sets the `token` cookie. Invalid credentials return `401`. |
| `GET /users/profile` | User | Return the authenticated user's profile. |
| `GET /users/logout` | User | Blacklist the current token and clear the token cookie. |

### Captains

| Method and path | Auth | Purpose and inputs |
| --- | --- | --- |
| `POST /captains/register` | No | Register with `fullname.firstname`, optional `fullname.lastname`, valid `email`, `password` (minimum 6 chars), and `vehicle` (`colour`, `plate`, `capacity`, `vehicleType`). Vehicle type is `car`, `motorcycle`, or `auto`. Returns `201` with `captian` (the response key is spelled this way) and `token`. |
| `POST /captains/login` | No | Authenticate with `email` and `password`. Returns `captian` and `token`; also sets the `token` cookie. Invalid credentials return `401`. |
| `GET /captains/profile` | Captain | Return the authenticated captain profile. |
| `GET /captains/stats` | Captain | Return completed rides, total earnings, online seconds, and online status. |
| `PATCH /captains/profile-image` | Captain | Set `profileImage` to a JPEG data URL (maximum 700 KB decoded) or `null` to remove it. |
| `PATCH /captains/payment-details` | Captain | Set `upiId` to a valid UPI ID, such as `name@bank`. |
| `GET /captains/logout` | Captain | Blacklist the current token, clear the cookie, and mark the captain offline. |

### Maps

All map routes require an authenticated **user** token.

| Method and path | Query parameters | Purpose |
| --- | --- | --- |
| `GET /maps/get-suggestions` | `input` (minimum 3 trimmed characters) | Return address suggestions from OpenRouteService. |
| `GET /maps/get-coordinates` | `address` (minimum 3 trimmed characters) | Resolve an address to `{ "lat": number, "lng": number }`. |
| `GET /maps/get-distance-time` | `origin`, `destination` (each minimum 3 chars) | Return distance and duration with human-readable `text` and numeric `value` (meters and seconds). |

### Rides

| Method and path | Auth | Inputs and purpose |
| --- | --- | --- |
| `GET /rides/get-fare` | User | Query `pickup` and `destination` to estimate fares for `auto`, `car`, and `moto`. |
| `POST /rides/create` | User | JSON body: `pickup`, `destination`, and `vehicleType` (`auto`, `car`, or `moto`). Creates a pending ride and returns its OTP to the rider. |
| `POST /rides/:rideId/accept` | Captain | Accept a pending request while online and sharing a location. |
| `POST /rides/:rideId/start` | Captain | JSON body: `{ "otp": "123456" }`. Starts the assigned ride after OTP verification. |
| `POST /rides/:rideId/complete` | Captain | JSON body: `{ "amountCollected": 100, "paymentMethod": "cash" }`; `paymentMethod` is `cash` or `upi`. Captain confirms receipt before completion. |
| `POST /rides/:rideId/cancel` | User | Cancel a pending or accepted ride. An ongoing ride cannot be cancelled through this route. |
| `PATCH /rides/:rideId/payment-method` | User | JSON body: `{ "paymentMethod": "cash" }` or `{ "paymentMethod": "upi" }` for an ongoing ride. |
| `GET /rides/active/user` | User | Return the rider's active ride, or `{ "ride": null }`. |
| `GET /rides/active/captain` | Captain | Return the captain's accepted or ongoing ride, or `{ "ride": null }`. |

Fare estimates are calculated using the route distance and duration and fixed rates in the backend. A rider may have only one pending, accepted, or ongoing ride at a time. Pending rides are offered to available captains within 2 km of the pickup; captains with an accepted or ongoing ride are not offered additional requests.

### Typical ride sequence

1. Rider requests an estimate and creates a ride.
2. Backend notifies nearby online captains; the ride stays pending if none are available.
3. A captain accepts, and the rider receives the captain assignment.
4. The rider shares the ride OTP; the captain submits it to start the trip.
5. During the ride, captain location is shared with the rider.
6. Rider selects cash or UPI; the captain confirms payment receipt and completes the trip.

UPI is a manual QR flow. The application does not automatically verify payments with a payment processor.

## Socket.IO

Connect to the same origin and port as the REST API. The client uses `withCredentials: true`.

### Client to server

| Event | Data | Purpose |
| --- | --- | --- |
| `join` | `{ "userId": "<account id>", "userType": "user" \| "captain" }` | Associate the socket connection with an account. |
| `captain-availability` | `{ "userId": "<captain id>", "isOnline": true \| false }` | Set captain availability. A captain is dispatchable only after a valid location update. |
| `update-location-captain` | `{ "userId": "<captain id>", "location": { "lat": number, "lng": number } }` | Share the captain's current coordinates. |
| `location-unavailable` | `{ "userId": "<captain id>" }` | Tell the server that location sharing is unavailable. |

### Server to client

| Event | Purpose |
| --- | --- |
| `join:success`, `join:error` | Report whether the account was associated with the socket. |
| `availability:updated`, `availability:error` | Report captain availability state or an error. |
| `location:updated`, `location:error` | Report location processing result. |
| `new-ride` | Notify a nearby captain about a pending request. The ride OTP is not included. |
| `ride-confirmed` | Notify a rider that a captain accepted their ride. |
| `ride-started` | Notify a rider that their ride has started. |
| `captain-location` | Send the assigned captain's location to the rider during a ride. |
| `ride-cancelled` | Notify an assigned captain when the rider cancels. |
| `ride-completed` | Notify the rider that the captain completed the ride and recorded payment. |

## Implementation notes

- Main entry points: `server.js` creates the HTTP server; `app.js` configures Express, middleware, and REST routes; `socket.js` configures live events.
- API groups are implemented in `routes/`, with request handling in `controllers/` and database operations in `services/`.
- Mongoose models are in `models/`. Passwords are hashed and JWTs are signed with `JWT_SECRET`.
- The backend package does not currently define a test script.
