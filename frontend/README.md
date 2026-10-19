# Frontend

React single-page application for the Uber Clone rider and captain workflows. It uses Vite for development and production builds, React Router for navigation, Axios for API calls, and Socket.IO for live ride updates.

## Requirements and setup

Install a supported Node.js release and npm, then configure the API base URL. Create `frontend/.env`:

```dotenv
VITE_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

From this directory, install dependencies and run the development server:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The backend must be running and configured with the matching frontend origin. For full-stack setup and backend configuration, see the [project README](../README.md) and [backend README](../backend/README.md).

Vite exposes `VITE_*` variables to browser code. Set both variables to the backend origin without a trailing path, and restart the development server after changing `.env`. API requests use `VITE_BASE_URL`; the rider logout page currently reads `VITE_API_URL`.

## Application routes

| Route | Experience |
| --- | --- |
| `/` | Welcome screen with rider and captain entry points |
| `/login`, `/signup` | Rider login and registration |
| `/home` | Protected rider home: address search, fare selection, ride request, and cancellation |
| `/riding` | Protected rider trip status, captain details, payment selection, and trip tracking |
| `/captain-login`, `/captain-signup` | Captain login and registration, including vehicle details |
| `/captain-home` | Protected captain dashboard: availability, nearby ride requests, profile settings, and stats |
| `/captain-riding` | Protected captain trip workflow, OTP entry, and trip completion |
| `/user/logout`, `/captain/logout` | Rider and captain logout flows |

Protected routes verify the stored token against the backend profile endpoint and redirect unauthenticated users to the relevant login screen.

## Ride workflow

### Rider

1. Register or sign in.
2. Search for pickup and destination addresses.
3. Review fare estimates and choose a vehicle.
4. Request a ride and share the generated OTP with the assigned captain at pickup.
5. Follow ride updates, select cash or UPI during an active trip, or cancel before the ride starts.

### Captain

1. Register with a vehicle, then sign in.
2. Allow browser location access and switch to online to receive nearby requests.
3. Review and accept a ride offer.
4. Enter the rider's OTP to start the ride.
5. Confirm cash or manual UPI payment receipt and complete the ride.

Captains can also update their profile image and UPI ID and view ride and online-time statistics. UPI payments are manually confirmed; no payment gateway is integrated.

## Development scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot module replacement |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | Run ESLint |

## Source layout

```text
src/
  components/  Ride panels, dialogs, captain details, and other shared UI
  context/     User, captain, and Socket.IO React contexts
  pages/       Route-level rider and captain screens
  assets/      Images and static assets imported by the client
  App.jsx      Application route definitions
  main.jsx     React bootstrap and context providers
```
