# API Quick Start Guide

## Base URL
```
http://10.159.191.161:3000/api/v1
```

## Step-by-Step: How to Access Protected Endpoints

### Step 1: Login to Get JWT Token

**Request:**
```bash
POST http://10.159.191.161:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Using curl (PowerShell):**
```powershell
curl -X POST http://10.159.191.161:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{\"email\":\"admin@example.com\",\"password\":\"admin123456\"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDE5NjEyMDB9.XXXXX",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**📋 COPY THE `access_token` VALUE!**

---

### Step 2: Access Protected Endpoints with Token

**Request:**
```bash
GET http://10.159.191.161:3000/api/v1/namespaces
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Using curl:**
```powershell
# Replace YOUR_TOKEN with the actual token from Step 1
curl http://10.159.191.161:3000/api/v1/namespaces -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Endpoints

### Authentication (No Token Required) 🔓

```bash
# Register new user (role: user)
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

# Login
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

### Profile (Token Required) 🔒

```bash
GET /api/v1/auth/profile
Authorization: Bearer YOUR_TOKEN
```

### User Management (Admin Only) 🔒👑

```bash
# Get all users
GET /api/v1/users
Authorization: Bearer YOUR_ADMIN_TOKEN

# Create user
POST /api/v1/users
Authorization: Bearer YOUR_ADMIN_TOKEN
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "user"
}

# Delete user
DELETE /api/v1/users/2
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Kubernetes Monitoring (Token Required) 🔒

```bash
# Get all namespaces
GET /api/v1/namespaces
Authorization: Bearer YOUR_TOKEN

# Get all pods
GET /api/v1/pods
Authorization: Bearer YOUR_TOKEN

# Get pods in specific namespace
GET /api/v1/pods?namespace=default
Authorization: Bearer YOUR_TOKEN

# Get all deployments
GET /api/v1/deployments
Authorization: Bearer YOUR_TOKEN

# Get all services
GET /api/v1/services
Authorization: Bearer YOUR_TOKEN

# Get all ingress
GET /api/v1/ingress
Authorization: Bearer YOUR_TOKEN

# Get all secrets
GET /api/v1/secrets
Authorization: Bearer YOUR_TOKEN

# Get all images
GET /api/v1/images
Authorization: Bearer YOUR_TOKEN
```

---

## Testing with Postman/Thunder Client

### 1. Login Request:
- Method: `POST`
- URL: `http://10.159.191.161:3000/api/v1/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123456"
  }
  ```

### 2. Copy Token from Response

### 3. Use Token in Other Requests:
- Method: `GET`
- URL: `http://10.159.191.161:3000/api/v1/namespaces`
- Headers: 
  - `Authorization: Bearer YOUR_TOKEN_HERE`

---

## Testing with Browser (Swagger UI)

Simply open your browser and go to:
```
http://10.159.191.161:3000/api
```

Then:
1. Click the **"Authorize"** button (🔒 icon in top-right)
2. Login to get your token
3. Enter the token in the format: `Bearer YOUR_TOKEN`
4. Click "Authorize"
5. Now you can test all endpoints directly in the browser!

---

## Example: Complete Flow with curl (PowerShell)

```powershell
# Step 1: Login and save response
$response = curl -X POST http://10.159.191.161:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{\"email\":\"admin@example.com\",\"password\":\"admin123456\"}' | ConvertFrom-Json

# Step 2: Extract token
$token = $response.access_token

# Step 3: Use token to access namespaces
curl http://10.159.191.161:3000/api/v1/namespaces -H "Authorization: Bearer $token"

# Step 4: Use token to access other endpoints
curl http://10.159.191.161:3000/api/v1/pods -H "Authorization: Bearer $token"
curl http://10.159.191.161:3000/api/v1/deployments -H "Authorization: Bearer $token"
curl http://10.159.191.161:3000/api/v1/users -H "Authorization: Bearer $token"
```

---

## Troubleshooting

### Error: "Unauthorized"
- ✅ Make sure you're including the `Authorization` header
- ✅ Make sure the token format is: `Bearer YOUR_TOKEN` (with space after Bearer)
- ✅ Make sure the token hasn't expired (tokens are valid for a limited time)
- ✅ Login again to get a fresh token

### Error: "Forbidden - Admin role required"
- ✅ Make sure you're logged in as an admin user
- ✅ Regular users cannot access admin-only endpoints like `/users`

### Error: "Cannot GET /namespaces"
- ✅ Make sure you're using the full URL with prefix: `/api/v1/namespaces`
- ✅ Not just `/namespaces`

---

## Admin Credentials

**Default Admin Account:**
- Email: `admin@example.com`
- Password: `admin123456`

⚠️ **Please change this password in production!**
