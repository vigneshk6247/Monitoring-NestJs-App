# Creating an Admin Login - Complete Guide

## Overview
This guide explains **3 different methods** to create an admin user in your Monitor Mobile App.

---

## Method 1: Using the Create Admin Script (Recommended for First Admin) ⭐

This method is perfect for creating your **first admin user** directly in the database.

### Steps:

1. **Run the admin creation script:**
   ```bash
   npx ts-node scripts/create-admin.ts
   ```

2. **Default credentials created:**
   - Email: `admin@example.com`
   - Password: `admin123456`
   - Role: `admin`

3. **Customize the script (Optional):**
   Edit `scripts/create-admin.ts` to change the default credentials before running.

4. **Login using the admin credentials:**
   ```bash
   POST http://localhost:3000/auth/login
   Content-Type: application/json

   {
     "email": "admin@example.com",
     "password": "admin123456"
   }
   ```

   Response:
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

> ⚠️ **Important:** Change the password immediately after your first login!

---

## Method 2: Using the Admin Registration Endpoint (For Creating Additional Admins)

This method allows **existing admins** to create new admin users via an API endpoint.

### Prerequisites:
- You must already have an admin account
- You must be logged in with a valid JWT token

### Steps:

1. **Login as an existing admin:**
   ```bash
   POST http://localhost:3000/auth/login
   Content-Type: application/json

   {
     "email": "admin@example.com",
     "password": "your_admin_password"
   }
   ```

2. **Copy the `access_token` from the response**

3. **Create a new admin user:**
   ```bash
   POST http://localhost:3000/auth/register-admin
   Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
   Content-Type: application/json

   {
     "email": "newadmin@example.com",
     "password": "securePassword123",
     "name": "New Admin User"
   }
   ```

   Response:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 2,
       "email": "newadmin@example.com",
       "name": "New Admin User",
       "role": "admin"
     }
   }
   ```

---

## Method 3: Direct Database Insertion (Advanced)

If you have direct access to your database, you can manually insert an admin user.

### MySQL Example:

1. **Hash the password first (use bcrypt with 10 rounds)**
   
2. **Insert the admin user:**
   ```sql
   INSERT INTO users (email, password, name, role, createdAt, updatedAt)
   VALUES (
     'admin@example.com',
     '$2b$10$HASHED_PASSWORD_HERE',
     'Admin User',
     'admin',
     NOW(),
     NOW()
   );
   ```

> ⚠️ **Note:** Make sure to use a properly hashed password using bcrypt with 10 salt rounds.

---

## API Endpoints Summary

### Public Endpoints (No Authentication Required):
- `POST /auth/register` - Register as a regular user (role: `user`)
- `POST /auth/login` - Login with email and password

### Protected Endpoints (Require JWT Token):
- `GET /auth/profile` - Get current user profile
- `POST /auth/register-admin` - Create admin user **(Admin only)**

### Admin-Only User Management:
- `POST /users` - Create any user with custom role
- `GET /users` - Get all users
- `GET /users/:id` - Get specific user
- `DELETE /users/:id` - Delete user

---

## Login Flow

### For Admin Users:

1. **Login:**
   ```bash
   POST /auth/login
   {
     "email": "admin@example.com",
     "password": "your_password"
   }
   ```

2. **Receive token:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "email": "admin@example.com",
       "name": "Admin User",
       "role": "admin"  ← Admin role
     }
   }
   ```

3. **Use the token for protected endpoints:**
   ```bash
   GET /users
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

### For Regular Users:

1. **Register or Login:**
   ```bash
   POST /auth/register
   {
     "email": "user@example.com",
     "password": "password123",
     "name": "Regular User"
   }
   ```

2. **Receive token with user role:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 2,
       "email": "user@example.com",
       "name": "Regular User",
       "role": "user"  ← Regular user role
     }
   }
   ```

3. **Regular users CANNOT access admin-only endpoints**

---

## Security Best Practices

1. ✅ **Always use strong passwords** (minimum 6 characters, but recommend 12+)
2. ✅ **Change default credentials** immediately after first login
3. ✅ **Store JWT tokens securely** (use httpOnly cookies or secure storage)
4. ✅ **Use HTTPS in production** to encrypt traffic
5. ✅ **Limit admin creation** to trusted administrators only
6. ✅ **Regularly audit admin accounts**

---

## Testing with Postman/Thunder Client

### 1. Create Admin (First Time):
```bash
npx ts-node scripts/create-admin.ts
```

### 2. Login as Admin:
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

### 3. Save the Token:
Copy the `access_token` from the response.

### 4. Access Admin Endpoints:
```
GET http://localhost:3000/users
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Troubleshooting

### Issue: "Forbidden - Admin role required"
**Solution:** Make sure you're using a JWT token from an admin user, not a regular user.

### Issue: "Unauthorized - Invalid or missing token"
**Solution:** Check that you're including the `Authorization: Bearer YOUR_TOKEN` header.

### Issue: "Conflict - Email already exists"
**Solution:** The email is already registered. Use a different email or login with existing credentials.

### Issue: Script fails to run
**Solution:** Make sure your database is running and the app is properly configured in `database.config.ts`.

---

## Quick Start Checklist

- [ ] Start your database (MySQL)
- [ ] Run `npm start` to start the NestJS server
- [ ] Run `npx ts-node scripts/create-admin.ts` to create first admin
- [ ] Test login with admin credentials
- [ ] Change the default password
- [ ] Create additional admins as needed using `/auth/register-admin`

---

## Need Help?

- Check the Swagger documentation at: `http://localhost:3000/api`
- Review the authentication decorators in `src/auth/decorators/`
- Check the guards in `src/auth/guards/`
