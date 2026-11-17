# Setup Verification Checklist

Use this guide to verify that the AI Expense Tracker is properly set up and ready for development.

## ✅ Backend Setup Verification

### 1. Python Environment
```bash
cd backend
python3 --version  # Should be 3.11+
```
**Expected Output**: Python 3.11 or higher

### 2. Virtual Environment
```bash
cd backend
source venv/bin/activate
pip list | grep -E "fastapi|sqlalchemy|pydantic"
```
**Expected Output**: Packages should be listed

### 3. Database
```bash
cd backend
source venv/bin/activate
python -c "from app import models; print('✓ Database models imported successfully')"
```
**Expected Output**: ✓ Database models imported successfully

### 4. Backend Server Startup
```bash
cd backend
source venv/bin/activate
timeout 5 uvicorn app.main:app --host 0.0.0.0 --port 8000
```
**Expected Output**: 
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 5. API Endpoints
```bash
# From another terminal with backend running
curl http://localhost:8000/api/health
```
**Expected Output**:
```json
{"status":"ok","message":"AI Expense Tracker is running"}
```

### 6. API Documentation
Visit: `http://localhost:8000/docs`
**Expected**: Swagger UI with all endpoints listed

## ✅ Frontend Setup Verification

### 1. Node.js and npm
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
```
**Expected Output**: Node 18+ and npm 8+

### 2. Dependencies
```bash
cd frontend
npm list react react-dom react-router-dom axios recharts
```
**Expected Output**: All packages listed with versions

### 3. Frontend Build
```bash
cd frontend
npm run build
```
**Expected Output**:
```
✓ built in X.XXs
```

### 4. Frontend Dev Server
```bash
cd frontend
timeout 5 npm run dev
```
**Expected Output**:
```
  VITE v5.X.X  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## ✅ Database Verification

### 1. Database File Creation
```bash
# After running backend once
ls -la backend/data/
```
**Expected Output**: `expense_tracker.db` file exists

### 2. Database Schema
```bash
cd backend
sqlite3 data/expense_tracker.db ".tables"
```
**Expected Output**:
```
ai_settings  budgets  categories  financial_goals  transactions  users
```

## ✅ Authentication Flow Verification

### 1. Register a Test User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected Output**:
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "created_at": "2024-..."
}
```

### 2. Login with Test User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected Output**:
```json
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

### 3. Get Current User (requires token from step 2)
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <TOKEN_FROM_STEP_2>"
```
**Expected Output**:
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "created_at": "2024-..."
}
```

## ✅ Frontend Authentication UI Verification

### 1. Launch Frontend
```bash
cd frontend
npm run dev
```

### 2. Visit Registration Page
Open: `http://localhost:5173`
**Expected**: Redirects to `/login` page

### 3. Register a User
- Click "Register here" link
- Fill form with:
  - Name: "Test User"
  - Email: "test2@example.com"
  - Password: "password123"
  - Confirm Password: "password123"
- Click "Create Account"
**Expected**: Redirects to Dashboard after successful registration

### 4. Verify Dashboard
**Expected**: 
- Shows username in sidebar
- Displays summary cards (may show zero values initially)
- Navigation menu visible
- Date displayed in header

### 5. Test Logout
- Click "Logout" at bottom of sidebar
**Expected**: Redirects to login page, token removed

## ✅ Category System Verification

### 1. Get Default Categories
```bash
curl -X GET http://localhost:8000/api/categories \
  -H "Authorization: Bearer <TOKEN>"
```
**Expected Output**: List of default categories for income and expenses

### 2. Verify Category Count
Categories created for test user:
- 12 default expense categories
- 6 default income categories
- Total: 18 categories

## ✅ Complete Setup Verification Script

Run this script to verify everything:

```bash
#!/bin/bash

echo "🔍 AI Expense Tracker Setup Verification"
echo "========================================"

# Python Check
echo -n "✓ Python version: "
python3 --version

# Node Check
echo -n "✓ Node version: "
node --version

# Backend imports
echo -n "✓ Backend imports: "
cd backend && source venv/bin/activate && python -c "from app import main" && echo "OK" || echo "FAILED"

# Frontend build
cd ../../frontend
echo -n "✓ Frontend build: "
npm run build > /dev/null 2>&1 && echo "OK" || echo "FAILED"

echo "========================================"
echo "✓ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && ./start-backend.sh"
echo "2. Start frontend: cd frontend && ./start-frontend.sh"
echo "3. Open browser: http://localhost:5173"
```

## 🚀 Quick Start After Verification

### Terminal 1: Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Open Browser
Visit: `http://localhost:5173`

## ✅ Common Issues & Solutions

### Issue: ModuleNotFoundError
**Solution**: Ensure virtual environment is activated
```bash
source venv/bin/activate
```

### Issue: Port Already in Use
**Solution**: Use different ports
```bash
# Backend on 8001
uvicorn app.main:app --reload --port 8001

# Frontend on 5174
npm run dev -- --port 5174
```

### Issue: Database Connection Error
**Solution**: Clear and reinitialize database
```bash
rm backend/data/expense_tracker.db
# Backend will recreate on next start
```

### Issue: CORS Errors in Frontend
**Solution**: Verify backend URL in frontend
- Check `vite.config.js` proxy configuration
- Ensure backend is running on http://localhost:8000

### Issue: Token Expired
**Solution**: Clear localStorage and login again
- In browser console: `localStorage.clear()`
- Or use incognito mode

## ✅ Verification Indicators

### Backend Ready ✓
- [ ] `http://localhost:8000/api/health` returns success
- [ ] `http://localhost:8000/docs` shows Swagger UI
- [ ] Can register new user via API
- [ ] Can login and get token
- [ ] Database file exists

### Frontend Ready ✓
- [ ] `http://localhost:5173` loads without errors
- [ ] Can navigate to login page
- [ ] Can register new user via UI
- [ ] Can login and see dashboard
- [ ] Logout clears token

### Full System Ready ✓
- [ ] Backend and frontend both running
- [ ] Can register and login via UI
- [ ] Dashboard displays (may show 0 values)
- [ ] Navigation menu works
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

**Once all verifications pass, you're ready for Stage 2 development! 🎉**
