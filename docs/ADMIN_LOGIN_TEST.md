# Admin Login Test

## Step 1: Login as Admin

**Endpoint:** `POST http://localhost:3000/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

---

## Step 2: Test Admin Access

**Endpoint:** `GET http://localhost:3000/users`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_FROM_STEP_1
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "createdAt": "2025-12-07T08:15:24.000Z",
    "updatedAt": "2025-12-07T08:15:24.000Z"
  }
]
```

---

## Step 3: Create Another Admin User (Optional)

**Endpoint:** `POST http://localhost:3000/auth/register-admin`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_FROM_STEP_1
```

**Request Body:**
```json
{
  "email": "admin2@example.com",
  "password": "securePassword123",
  "name": "Second Admin"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "admin2@example.com",
    "name": "Second Admin",
    "role": "admin"
  }
}
```

---

## Summary

✅ **Admin user created:** `admin@example.com` / `admin123456`

⚠️ **Important:** Change this password after your first login!

### Quick Test Commands (PowerShell/CMD):

```powershell
# Test login
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123456\"}"

# Or use the full URL with api/v1 prefix if configured
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123456\"}"
```
