# Backend API: User Registration

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

##### `401 Unauthorized`

The token is missing, invalid, expired, or blacklisted:

```jsonc
{
  "message": "Unauthorized"
}
```

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
