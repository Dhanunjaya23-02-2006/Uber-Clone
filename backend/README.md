# Backend API Reference

The API server listens on port `3000` by default. Routes are mounted under
`/users`, `/captains`, `/maps`, and `/rides`. Authenticated endpoints accept a
JWT in the `Authorization: Bearer <token>` header or in the `token` cookie.

Configure the backend with a `.env` file containing `MONGODB_URI`, `JWT_SECRET`,
and `OPENROUTESERVICE_API_KEY`. `PORT` and `FRONTEND_URL` are optional; they
default to `3000` and `http://localhost:5173`, respectively. Set `FRONTEND_URL`
to the exact browser origin, or use comma-separated `FRONTEND_URLS` to allow
multiple origins. In non-production environments, HTTPS origins under
`*.devtunnels.ms` are also allowed for VS Code Dev Tunnels. Start the server
from the backend directory with `node server.js`.
Set the frontend's `VITE_BASE_URL` to the backend URL (for example,
`http://localhost:3000`) so the client can reach these routes.

The root health/welcome route is `GET /` and returns `Welcome to uber clone`.

## `/users/register Endpoint`

Registers a user account and returns the created user together with an
authentication token.

### Request body

Send a JSON object with the following fields:

| Field | Type | Required | Requirements |
| --- | --- | --- | --- |
| `fullname` | Object | Yes | Must contain `firstname`; `lastname` is optional. |
| `fullname.firstname` | String | Yes | At least 3 characters. |
| `fullname.lastname` | String | No | If provided, at least 3 characters. |
| `email` | String | Yes | Must be a valid email address. |
| `password` | String | Yes | At least 6 characters. |

Example:

```json
{
  "fullname": {
    "firstname": "Alex",
    "lastname": "Morgan"
  },
  "email": "alex@example.com",
  "password": "secret123"
}
```

Send the body with the `Content-Type: application/json` header.

### Responses

#### `201 Created`

Registration succeeded. The response contains the created user and an
authentication token. For example:

```json
{
  "user": {
    "fullname": {
      "firstname": "Alex",
      "lastname": "Morgan"
    },
    "email": "alex@example.com",
    "password": "$2b$10$exampleHashedPasswordValue",
    "_id": "66f1234567890abcdef12345",
    "__v": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The `user` object in the success response has this structure:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user` | Object | Yes | The newly registered user. |
| `user.fullname` | Object | Yes | Contains the user's name. |
| `user.fullname.firstname` | String | Yes | The user's first name. |
| `user.fullname.lastname` | String | No | The user's last name, if provided. |
| `user.email` | String | Yes | The user's email address. |
| `user.password` | String | Yes | The stored password hash; the plain-text password is not returned. |
| `user._id` | String | Yes | MongoDB identifier for the user. |
| `user.__v` | Number | Yes | Mongoose version key. |
| `token` | String | Yes | Authentication token for the user. |

#### `400 Bad Request`

One or more request fields failed validation. The response contains the
validation errors. For example, an invalid email produces a response like:

```json
{
  "errors": [
    {
      "type": "field",
      "value": "not-an-email",
      "msg": "Invalid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

## `/users/login` Endpoint

Authenticates an existing user and returns the user record together with an
authentication token.

### Request body

Send a JSON object with these fields:

| Field | Type | Required | Requirements |
| --- | --- | --- | --- |
| `email` | String | Yes | Must be a valid email address. |
| `password` | String | Yes | At least 6 characters. |

Example:

```json
{
  "email": "alex@example.com",
  "password": "secret123"
}
```

Send the body with the `Content-Type: application/json` header.

### Responses

#### `200 OK`

Login succeeded. The response includes the user and an authentication token.
The password value shown is the stored hash, not the submitted password:

```json
{
  "user": {
    "fullname": {
      "firstname": "Alex",
      "lastname": "Morgan"
    },
    "email": "alex@example.com",
    "password": "$2b$10$exampleHashedPasswordValue",
    "_id": "66f1234567890abcdef12345",
    "__v": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `400 Bad Request`

The email or password failed request validation. The response includes the
validation errors, for example:

```json
{
  "errors": [
    {
      "type": "field",
      "value": "not-an-email",
      "msg": "Invalid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

#### `401 Unauthorized`

No user exists with that email, or the password does not match:

```json
{
  "message": "Invalid email or password"
}
```

## `/users/profile` Endpoint

Returns the authenticated user's profile.

### Request

Send a `GET` request with the token returned by `/users/login`. Authenticate
using a Bearer token in the `Authorization` header, or send the `token` cookie
set by login. In Postman, choose **Bearer Token** in the **Authorization** tab
and paste the login response's `token` value. No request body is required.

### Responses

#### `200 OK`

The authenticated user's profile is returned:

```json
{
  "user": {
    "fullname": {
      "firstname": "Alex",
      "lastname": "Morgan"
    },
    "email": "alex@example.com",
    "_id": "66f1234567890abcdef12345",
    "__v": 0
  }
}
```

The password is excluded from this response.

#### `401 Unauthorized`

The token is missing, invalid, expired, or blacklisted:

```json
{
  "message": "Unauthorized"
}
```

## `/users/logout` Endpoint

Logs out the authenticated user, adds the current token to the token blacklist,
and clears the `token` cookie.

### Request

Send a `GET` request authenticated with the login token, either as a Bearer
token in the `Authorization` header or as the `token` cookie. In Postman,
choose **Bearer Token** in the **Authorization** tab and paste the login
response's `token` value. No request body is required.

### Responses

#### `200 OK`

The user was logged out:

```json
{
  "message": "Logged out successfully"
}
```

#### `401 Unauthorized`

The token is missing, invalid, expired, or blacklisted:

```json
{
  "message": "Unauthorized"
}
```

### Authentication

Requires a valid jwt token in the authorization header or cookies

## Captain Routes

Captain routes are mounted at `/captains`.

### `POST /captains/register`

Registers a captain and their vehicle, then returns the created captain and an
authentication token.

#### Request body

Send JSON with `Content-Type: application/json`. This JSONC example includes
comments with field requirements and constraints:

```jsonc
{
  "fullname": {
    "firstname": "Alex", // Required; non-empty and at least 3 characters per model.
    "lastname": "Morgan" // Optional; if provided, at least 3 characters.
  },
  "email": "captain@example.com", // Required; valid and unique email address.
  "password": "secret123", // Required; at least 6 characters.
  "vehicle": {
    "colour": "blue", // Required; at least 3 characters.
    "plate": "ABC123", // Required; at least 3 characters.
    "capacity": 4, // Required integer; at least 1.
    "vehicleType": "car" // Required; "car", "motorcycle", or "auto".
  }
}
```

#### Responses

##### `201 Created`

Registration succeeded. The response property is named `captian` by the
current API. The example is JSONC so comments can explain response fields:

```jsonc
{
  "captian": {
    "_id": "66f1234567890abcdef12345",
    "fullname": {
      "firstname": "Alex",
      "lastname": "Morgan"
    },
    "email": "captain@example.com", // Registered email; password is omitted.
    "status": "inactive", // New captains default to inactive.
    "vehicle": {
      "colour": "blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "__v": 0 // Mongoose version key.
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The password is not included in the captain object.

##### `400 Bad Request`

The request failed validation, or a captain is already registered with the
email address. Validation errors are returned as an `errors` array, for
example:

```json
{
  "errors": [
    {
      "type": "field",
      "value": "not-an-email",
      "msg": "Please provide a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

For a duplicate email, the response is:

```json
{
  "message": "Captain with this email already exists"
}
```

### `POST /captains/login`

Authenticates a captain and returns their profile with a JWT. The response
property is currently spelled `captian`. A successful login also sets the
`token` cookie.

#### Request body

Send JSON with `Content-Type: application/json`:

```jsonc
{
  "email": "captain@example.com", // Required; must be a valid email address.
  "password": "secret123" // Required; at least 6 characters.
}
```

#### Responses

##### `200 OK`

```jsonc
{
  "captian": {
    "_id": "66f1234567890abcdef12345",
    "fullname": {
      "firstname": "Alex",
      "lastname": "Morgan"
    },
    "email": "captain@example.com",
    "status": "inactive",
    "vehicle": {
      "colour": "blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "__v": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT expires in 24 hours.
}
```

The password is excluded from the returned captain object.

##### `400 Bad Request`

Request validation failed. The response contains an `errors` array, as in the
registration endpoint's validation response.

##### `401 Unauthorized`

The email does not match a registered captain or the password is incorrect:

```jsonc
{
  "message": "Invalid email or password"
}
```

### `GET /captains/profile`

Returns the authenticated captain's profile. No request body is required.
Authenticate with the JWT returned by registration or login, using either an
`Authorization` Bearer token or the `token` cookie.

#### Responses

##### `200 OK`

```jsonc
{
  "captian": {
    "_id": "66f1234567890abcdef12345",
    "fullname": {
      "firstname": "Alex",
      "lastname": "Morgan"
    },
    "email": "captain@example.com",
    "status": "inactive",
    "vehicle": {
      "colour": "blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    },
    "__v": 0
  }
}
```

The password is excluded from the profile response.

### `GET /captains/stats`

Returns the authenticated captain's total completed-ride earnings, cumulative
online time in seconds, completed ride count, and current online status. Online
time is tracked while the captain is online and sharing location; dashboard
values refresh while the captain home is open.

Example response:

```json
{
  "totalEarnings": 295.2,
  "completedRides": 1,
  "onlineSeconds": 3672,
  "isOnline": true
}
```

### `PATCH /captains/profile-image`

Saves or removes the authenticated captain's profile photo. Submit a
JPEG data URL in `profileImage` (maximum decoded size 700 KB), or `null` to
restore the default profile icon. The captain app resizes selected images
before saving them.

```json
{
  "profileImage": "data:image/jpeg;base64,..."
}
```

##### `401 Unauthorized`

The token is missing, invalid, expired, or blacklisted:

```jsonc
{
  "message": "Unauthorized"
}
```

## Map Routes

All map routes are mounted at `/maps` and require an authenticated user token.
The backend uses OpenRouteService for geocoding, autocomplete, and routing.

### `GET /maps/get-suggestions`

Returns up to five autocomplete address labels for the supplied search text.

| Query parameter | Type | Required | Requirements |
| --- | --- | --- | --- |
| `input` | String | Yes | At least 3 characters after trimming. |

Example request:

```http
GET /maps/get-suggestions?input=Hyderabad%20airport
Authorization: Bearer <token>
```

The response is an array of strings:

```json
[
  "Rajiv Gandhi International Airport, Hyderabad, Telangana, India"
]
```

### `GET /maps/get-coordinates`

Looks up the latitude and longitude for an address.

| Query parameter | Type | Required | Requirements |
| --- | --- | --- | --- |
| `address` | String | Yes | At least 3 characters after trimming. |

Example success response:

```json
{
  "lat": 17.2403,
  "lng": 78.4294
}
```

### `GET /maps/get-distance-time`

Returns driving distance and duration between two addresses. Both values in
the response include a human-readable `text` value and a numeric `value`
(distance in meters and duration in seconds).

| Query parameter | Type | Required | Requirements |
| --- | --- | --- | --- |
| `origin` | String | Yes | At least 3 characters. |
| `destination` | String | Yes | At least 3 characters. |

Example success response:

```json
{
  "distance": {
    "text": "12.34 km",
    "value": 12340
  },
  "duration": {
    "text": "25 mins",
    "value": 1500
  }
}
```

Map routes return `400 Bad Request` for invalid query parameters,
`401 Unauthorized` for a missing, invalid, expired, or blacklisted token, and
`502 Bad Gateway` when OpenRouteService is unavailable. Coordinate and
distance lookups return `404 Not Found` when an address has no match.

## Ride Routes

### `GET /rides/get-fare`

Calculates estimated fares for all supported vehicle types between a pickup
and destination. This endpoint requires an authenticated user token.

#### Query parameters

| Parameter | Type | Required | Requirements |
| --- | --- | --- | --- |
| `pickup` | String | Yes | At least 3 characters. |
| `destination` | String | Yes | At least 3 characters. |

Example request:

```http
GET /rides/get-fare?pickup=Gachibowli%2C%20Hyderabad&destination=Rajiv%20Gandhi%20International%20Airport%2C%20Hyderabad
Authorization: Bearer <token>
```

#### Responses

`200 OK` returns an object with estimated fares keyed by vehicle type:

```json
{
  "auto": 250,
  "car": 380,
  "moto": 190
}
```

The fare is calculated using the route distance and duration returned by
OpenRouteService, together with a vehicle-specific base fare, per-kilometer
rate, and per-minute rate. Values are rounded to the nearest whole unit.

`400 Bad Request` is returned when either query parameter is missing or
shorter than 3 characters. `401 Unauthorized` is returned when the user token
is missing or invalid. `500 Internal Server Error` is returned if fare
calculation fails, such as when the mapping service cannot resolve the
addresses or calculate a route.

### `POST /rides/create`

Creates a ride for the authenticated user. The fare is calculated from the
pickup and destination addresses using the configured OpenRouteService API key.

#### Request body

| Field | Type | Required | Requirements |
| --- | --- | --- | --- |
| `pickup` | String | Yes | At least 3 characters. |
| `destination` | String | Yes | At least 3 characters. |
| `vehicleType` | String | Yes | One of `auto`, `car`, or `moto`. |

Example:

```json
{
  "pickup": "Gachibowli, Hyderabad",
  "destination": "Rajiv Gandhi International Airport, Hyderabad",
  "vehicleType": "car"
}
```

#### Responses

`201 Created` returns the created ride document, including its generated ID,
pickup and destination, calculated fare, and initial `pending` status. Its OTP
is returned only in this authenticated rider response. It is never included in
the `new-ride` socket event sent to captains. The backend emits that event to
logged-in captains who have shared a location within 2 km of the pickup. If no
captain is nearby at request time, the ride remains pending and the rider sees
a driver-searching state. When a captain next shares a location within 2 km,
the pending ride is sent to that captain.

`400 Bad Request` is returned when a request field fails validation.
`401 Unauthorized` is returned when the user token is missing or invalid.
`404 Not Found` is returned when the pickup cannot be geocoded. `409 Conflict`
is returned when the rider already has an active ride. `502 Bad Gateway` is
returned when the location service cannot complete the search.

### `POST /rides/:rideId/accept`

Accepts a pending ride for the authenticated captain. The captain must be
connected and have shared a valid location. A successful acceptance returns
the ride with captain name, vehicle, and location details, and emits a
`ride-confirmed` socket event to the rider.

`409 Conflict` is returned if the captain is not online with location sharing
enabled or another captain has already accepted the ride. The ride OTP is not
included in the response.

### `POST /rides/:rideId/start`

Starts an accepted ride after the assigned captain enters the 6-digit OTP
provided by the rider.

```json
{
  "otp": "123456"
}
```

The OTP must match the ride assigned to the authenticated captain. A successful
response includes the ride's `ongoing` status and does not include the OTP.
`400 Bad Request` is returned for an invalid OTP or an invalid ride state.

### Active ride and completion endpoints

`GET /rides/active/user` returns the authenticated rider's pending, accepted,
or ongoing ride, including the OTP for that rider only and the assigned
captain's public profile once assigned. `GET /rides/active/captain` returns the
authenticated captain's accepted or ongoing ride, without the rider's OTP.
Both endpoints return `{ "ride": null }` when there is no active ride.

Captain availability is controlled from the captain home screen over the
Socket.IO `captain-availability` event. A captain becomes `active` only after
enabling online mode and sharing a valid location; choosing offline changes the
stored status to `inactive` and stops ride dispatch to that captain. Location
updates keep the rider informed during an active ride, and busy captains are
not offered additional rides.

`POST /rides/:rideId/complete` marks an ongoing ride completed for its assigned
captain after the captain confirms receipt of payment. The accepted payment
methods are cash and manual UPI QR. The captain must confirm receipt; the QR is
not automatically verified by a payment gateway. Cash requires the captain to
enter the exact ride fare. Payment method, amount, and paid status are saved
with the ride. The rider receives a `ride-completed` socket event with the
payment details when connected.
While a ride is accepted or ongoing, captain location updates are forwarded to
the rider as `captain-location` socket events. Ride start is sent to the rider
as `ride-started`.

`POST /rides/:rideId/cancel` allows the authenticated rider to cancel their
pending and accepted ride requests. This also clears any older outstanding
requests, so they cannot be restored as active rides later. Assigned captains
are notified with `ride-cancelled`. Rides that have started cannot be
cancelled through this endpoint. A rider with an active ride cannot create
another request until the existing ride is cancelled or completed.

`PATCH /rides/:rideId/payment-method` lets the rider select `cash` or `upi`
for an ongoing ride. UPI is available only after the captain saves a valid UPI
ID in captain details. The captain is notified of the selected payment method.
For UPI, the QR shown on the captain's finish screen requests the exact ride
fare; the rider scans it in a payment app, and the captain verifies receipt
manually before marking the ride paid.

`PATCH /captains/payment-details` saves the authenticated captain's UPI ID for
receiving manual UPI QR payments. The UPI ID is included only in the assigned
ride's captain details.

### `GET /captains/logout`

Logs out the authenticated captain by blacklisting the current token and
clearing the `token` cookie. No request body is required; authenticate in the
same way as the profile endpoint.

#### Responses

##### `200 OK`

```jsonc
{
  "message": "Logout successfully"
}
```

##### `401 Unauthorized`

The token is missing, invalid, expired, or blacklisted:

```jsonc
{
  "message": "Unauthorized"
}
```
