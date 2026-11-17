# Testing Guide: Login Bug Fix

This guide will walk you through testing the login fix step-by-step.

## Pre-Test Checklist

- [ ] Backend code has been updated
- [ ] Frontend code has been updated
- [ ] You have this file open
- [ ] You have browser developer tools knowledge (F12)
- [ ] Terminal access ready

## ⚠️ Important: Clean Slate (Optional but Recommended)

If you want to test with fresh data:

```bash
cd backend
rm -f data/expense_tracker.db
```

This will delete any existing test users so you can start fresh.

## Step 1: Start Backend

**Terminal 1:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ Backend is running on: http://localhost:8000

## Step 2: Start Frontend

**Terminal 2 (New):**
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.X.X  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

✅ Frontend is running on: http://localhost:5173

## Step 3: Open Browser and Developer Tools

1. Open browser: **http://localhost:5173**
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Keep this tab open throughout testing

## Step 4: Test Registration (Fresh Account)

### 4.1 Navigate to Registration

1. You should see the Login page
2. Click "**Register here**" link
3. URL should change to: `http://localhost:5173/register`

### 4.2 Fill Registration Form

Fill in these exact credentials:
- **Name**: `Test User`
- **Email**: `testuser@example.com`
- **Password**: `password123`
- **Confirm Password**: `password123`

### 4.3 Submit Registration

1. Click "**Create Account**" button
2. **Watch Console** for messages:
   ```
   Attempting login for: testuser@example.com
   Login successful, received token
   Token set: eyJ0eXAi... (first 20 chars)
   ```

### 4.4 Expected Result

After registration, you should:
- ✅ Automatically be logged in
- ✅ Automatically redirect to Dashboard
- ✅ See "Test User" in sidebar
- ✅ See navigation menu
- ✅ See summary cards

**If this works**: Registration + Auto-login works! ✅

## Step 5: Logout and Test Manual Login

### 5.1 Logout

1. Click "**Logout**" button at bottom of sidebar
2. **Watch Console** for:
   ```
   Token cleared
   ```
3. URL should change to: `http://localhost:5173/login`

### 5.2 Fill Login Form

Fill in:
- **Email**: `testuser@example.com`
- **Password**: `password123`

### 5.3 Click Sign In

1. Click "**Sign In**" button
2. **Watch Console** carefully for:

```
Attempting login for: testuser@example.com
Login successful, received token
Token set: eyJ0eXAi...
Fetching user with token...
User fetched successfully: {id: 1, name: "Test User", email: "testuser@example.com", ...}
```

### 5.4 Expected Result

- ✅ No 401 error
- ✅ Redirect to Dashboard
- ✅ See "Test User" in sidebar
- ✅ Navigation menu visible
- ✅ No error message

**If this works**: Login with correct credentials works! ✅

## Step 6: Test Error Handling

### 6.1 Test Wrong Password

1. Click "**Logout**"
2. Wait for redirect to login
3. Fill in:
   - **Email**: `testuser@example.com`
   - **Password**: `wrongpassword`
4. Click "**Sign In**"

### 6.2 Expected Result

- ✅ **Red error box** appears with: "Invalid email or password"
- ✅ **Console shows:**
  ```
  Login error: {status: 401, data: {detail: "Invalid email or password"}, ...}
  ```
- ✅ **Still on login page** (not redirected)
- ✅ Can try again

**If this works**: Wrong password error handling works! ✅

### 6.3 Test Non-Existent Email

1. Fill in:
   - **Email**: `nonexistent@example.com`
   - **Password**: `password123`
2. Click "**Sign In**"

### 6.4 Expected Result

- ✅ **Red error box** appears with: "Invalid email or password"
- ✅ **Still on login page**

**If this works**: Non-existent user error handling works! ✅

## Step 7: Verify Token Storage

### 7.1 Check localStorage

In **Browser Console**, run:
```javascript
localStorage.getItem('token')
```

### 7.2 Expected Result

```
"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImV4cCI6MTc5NTQ1NTIyMX0..."
```

✅ Token is stored as JWT

### 7.3 Check Axios Headers

In **Browser Console**, run:
```javascript
axios.defaults.headers.common['Authorization']
```

### 7.4 Expected Result

```
"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImV4cCI6MTc5NTQ1NTIyMX0..."
```

✅ Authorization header is set correctly

## Step 8: Test Token Persistence

### 8.1 Refresh Page

1. Log in first (or already logged in)
2. Press **F5** to refresh page
3. Watch console for:
   ```
   Token set: eyJ0eXAi...
   Fetching user with token...
   User fetched successfully: {...}
   ```

### 8.2 Expected Result

- ✅ **Still logged in** after refresh
- ✅ **Dashboard loads** without redirecting to login
- ✅ **User name visible** in sidebar

**If this works**: Token persistence works! ✅

## Step 9: Browser DevTools Network Tab Check

### 9.1 Open Network Tab

1. Click "**Network**" tab in DevTools
2. Click "**Logout**"
3. Go through login again

### 9.2 Check Login Request

Find the `login` POST request:
1. Click on it
2. Go to "**Request Headers**" section
3. Verify header is there: `Content-Type: application/json`

### 9.3 Check Login Response

1. Go to "**Response**" section
2. Should see:
```json
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

### 9.4 Check Me Request

Find the `me` GET request:
1. Click on it
2. Go to "**Request Headers**" section
3. **Should see**: `Authorization: Bearer eyJ0eXAi...`

**If Authorization header is present**: Network requests are correct! ✅

## Step 10: Final Verification Checklist

### Registration Flow
- [ ] Can register with new email
- [ ] Default categories created
- [ ] Auto-login after registration works
- [ ] Redirects to dashboard

### Login Flow
- [ ] Can login with correct credentials
- [ ] No 401 error on login
- [ ] Redirects to dashboard
- [ ] User name appears in sidebar

### Error Handling
- [ ] Wrong password shows error message
- [ ] Non-existent email shows error message
- [ ] Error message is clear and specific
- [ ] Can retry after error

### Token Management
- [ ] Token stored in localStorage
- [ ] Authorization header set correctly
- [ ] Token persists across refresh
- [ ] Token sent with API requests

### Navigation
- [ ] Can navigate between pages
- [ ] Cannot access protected routes without token
- [ ] Logout clears token
- [ ] Logout redirects to login

## All Checks Passed? ✅

If all the above tests passed, the login bug is **FIXED**!

You can now proceed to **Stage 2 - Transaction Management Implementation**.

## Troubleshooting

### Problem: Still Getting 401 Error

**Solution 1: Check Backend Running**
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"ok",...}
```

**Solution 2: Clear Cache**
1. Press **Ctrl+Shift+Delete** to open Clear Browsing Data
2. Select "Cookies and other site data"
3. Clear for `localhost:5173`
4. Refresh page

**Solution 3: Check Console for Errors**
1. Open Browser Console (F12)
2. Look for red error messages
3. Copy full error message
4. Check that it matches error handling

### Problem: Token Not Persisting

**Check localStorage:**
```javascript
localStorage.getItem('token')
// Should NOT return null
```

**If null**: Browser localStorage might be disabled
- Check browser privacy settings
- Try incognito mode

### Problem: Registration Fails

**Check backend logs:**
1. Look at Terminal 1 (backend)
2. Should see POST request to /api/auth/register
3. If error, check database: `sqlite3 backend/data/expense_tracker.db ".schema users"`

### Problem: User Not Fetching

**Check network:**
1. Open Network tab (F12)
2. Look for `me` GET request
3. Check response status (should be 200)
4. Check Authorization header is present

## Need More Help?

1. Read: `BUG_FIX_REPORT.md` - Detailed explanation of the fix
2. Check: `README.md` - General setup instructions
3. Verify: `SETUP_VERIFICATION.md` - System verification guide

---

**Status**: Testing Guide Ready
**Next**: Execute tests and verify all checks pass
**Then**: Move to Stage 2 Implementation
