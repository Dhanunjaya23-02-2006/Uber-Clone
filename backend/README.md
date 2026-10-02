# Backend API: User Registration

## `POST /users/register`

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
