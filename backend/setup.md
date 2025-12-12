# Backend Setup Guide

## Environment Variables

Create a `.env` file in the `backend code` directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/lifeos

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Installation Steps

1. **Install dependencies:**
   ```bash
   cd "backend code"
   npm install
   ```

2. **Start MongoDB** (if using local database):
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud service)

3. **Start the server:**
   ```bash
   npm run dev
   ```

## Testing the API

Once the server is running, you can test the endpoints:

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Create a pillar (with auth token):**
   ```bash
   curl -X POST http://localhost:3000/pillars \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"name":"Health & Fitness","description":"Maintaining physical and mental well-being","category":"Health","color":"#10b981","icon":"Heart"}'
   ```

## Frontend Connection

The frontend is now configured to connect to `http://localhost:3000`. Make sure both frontend and backend are running:

- **Backend:** `http://localhost:3000`
- **Frontend:** `http://localhost:5173`

## Troubleshooting

1. **CORS errors:** Make sure the CORS_ORIGIN in .env matches your frontend URL
2. **MongoDB connection:** Ensure MongoDB is running and accessible
3. **Port conflicts:** Change PORT in .env if 3000 is already in use 