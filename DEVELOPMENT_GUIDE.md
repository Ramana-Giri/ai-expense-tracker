# Development Guide: AI Expense Tracker

## Current Status: Stage 1 - Foundation Complete ✅

This guide documents the development progress and what remains to be implemented.

## What Has Been Completed (Stage 1)

### Project Structure ✅
- Backend FastAPI application with modular route structure
- Frontend React + Vite + Tailwind CSS setup
- SQLite database with SQLAlchemy ORM
- Complete project folder organization

### Database Design ✅
- **users**: User authentication and profiles
- **categories**: Income and expense categories (with defaults)
- **transactions**: Financial transactions (stored in paise)
- **budgets**: Monthly budgets
- **financial_goals**: Savings goal tracking
- **ai_settings**: AI provider configuration

### Authentication ✅
- User registration with email validation
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with user data isolation
- Login/logout functionality

### API Endpoints ✅
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout

### Frontend Foundation ✅
- React routing with protected/public routes
- Authentication context with token management
- Responsive dashboard layout with sidebar navigation
- Login and registration pages
- Placeholder pages for all main sections

### Configuration ✅
- Environment variables support
- CORS setup for local development
- Database auto-initialization
- Encryption key management

## Running the Application

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Quick Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open: `http://localhost:5173`

### Or Use Startup Scripts
```bash
# From project root
./start-backend.sh  # Terminal 1
./start-frontend.sh # Terminal 2
```

### API Documentation
Once backend is running, visit: `http://localhost:8000/docs`

## Next Steps: Stage 2 - Expense Tracker (Ready for Implementation)

The following are fully designed and ready to implement:

### 1. Transaction Management ✅ Designed, Not Yet Implemented
- [ ] Add/edit/delete transactions UI
- [ ] Transaction search and filtering  
- [ ] Category assignment during creation
- [ ] Transaction table with sorting
- [ ] CSV export functionality
- [ ] Modal dialogs for forms

**Routes Ready:**
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/export/csv` - Export CSV

### 2. Categories Management ✅ Designed, Not Yet Implemented
- [ ] Display default categories
- [ ] Create custom categories
- [ ] Edit category names
- [ ] Delete custom categories
- [ ] Category selection in transactions

**Routes Ready:**
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### 3. Dashboard Analytics ✅ Designed, Routes Ready
Currently shows placeholder, needs data integration:
- [ ] Summary cards (Income, Expenses, Balance, Savings)
- [ ] Spending trend chart
- [ ] Category breakdown pie chart
- [ ] Income vs expense comparison
- [ ] Top spending categories
- [ ] Recent transactions table

**Routes Ready:**
- `GET /api/dashboard/summary` - Financial summary
- `GET /api/dashboard/spending-trend` - Daily/monthly trends
- `GET /api/dashboard/category-breakdown` - Expense by category
- `GET /api/dashboard/income-vs-expense` - Monthly comparison
- `GET /api/dashboard/top-categories` - Top categories
- `GET /api/dashboard/recent-transactions` - Recent transactions

### 4. Budget Management ✅ Designed, Not Yet Implemented
- [ ] Create monthly budgets
- [ ] Category-specific budgets
- [ ] Budget progress visualization
- [ ] Overspending alerts
- [ ] Edit/delete budgets

**Routes Ready:**
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/{id}/status` - Budget status with calculations
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### 5. Financial Goals ✅ Designed, Not Yet Implemented
- [ ] Create savings goals
- [ ] Track progress toward goals
- [ ] Calculate estimated completion date
- [ ] Suggest monthly contribution
- [ ] Edit/delete goals

**Routes Ready:**
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal

## Stage 3: Financial Goals & Affordability (Design Complete)

Backend calculations are ready for:
- Purchase affordability analysis
- EMI calculations
- Savings scenario planning
- Monthly contribution recommendations

Routes ready for implementation:
- `POST /api/ai/chat` - Chat endpoint (for affordability queries)

## Stage 4: AI Integration (To Be Implemented)

### AI Provider Abstraction Layer
- [ ] Base AIProvider interface
- [ ] GoogleGeminiProvider implementation
- [ ] OpenAIProvider implementation
- [ ] AnthropicProvider implementation
- [ ] Model discovery/listing

### AI Tool Framework
- [ ] Tool definition system
- [ ] Tool execution engine
- [ ] Response parsing
- [ ] Error handling

### AI Financial Assistant Features
- [ ] Natural-language expense entry
- [ ] Automatic expense categorization
- [ ] Spending pattern analysis
- [ ] Financial relationship analysis
- [ ] Affordability analysis
- [ ] EMI vs cash comparison

### AI Settings UI
- [ ] Provider selection
- [ ] Model selection
- [ ] API key configuration (secure storage)
- [ ] Connection testing
- [ ] Key deletion

### Chat Interface
- [ ] Message history
- [ ] Tool execution activity display
- [ ] Suggested prompts
- [ ] Real-time response streaming (optional)
- [ ] Error recovery

## Stage 5: Quality & Polish

- [ ] Comprehensive error handling
- [ ] Loading states and skeletons
- [ ] Empty state messages
- [ ] Success/error notifications
- [ ] Responsive design refinement
- [ ] Accessibility improvements
- [ ] Performance optimization

## File Structure Reference

```
backend/app/
├── models.py              # SQLAlchemy ORM models
├── schemas.py             # Pydantic request/response schemas
├── security.py            # JWT authentication & hashing
├── encryption.py          # Fernet encryption for API keys
├── routes/
│   ├── auth.py           # Authentication endpoints ✅
│   ├── transactions.py    # Transaction CRUD endpoints (ready)
│   ├── categories.py      # Category management (ready)
│   ├── dashboard.py       # Analytics endpoints (ready)
│   ├── budgets.py         # Budget management (ready)
│   ├── goals.py           # Goals management (ready)
│   └── ai.py              # AI endpoints (placeholder)
├── services/              # Business logic (to add)
├── ai_providers/          # AI provider adapters (to add)
└── tests/                 # Unit tests (to add)

frontend/src/
├── pages/
│   ├── LoginPage.jsx         # Login page ✅
│   ├── RegisterPage.jsx      # Registration page ✅
│   ├── Dashboard.jsx         # Dashboard (partial)
│   ├── Transactions.jsx      # Transaction management (stub)
│   ├── Budgets.jsx          # Budget management (stub)
│   ├── Goals.jsx            # Goals management (stub)
│   ├── AIAssistant.jsx      # AI chat interface (stub)
│   └── Settings.jsx         # Settings page (stub)
├── layouts/
│   └── DashboardLayout.jsx  # Main dashboard layout ✅
├── context/
│   └── AuthContext.jsx      # Authentication state ✅
└── utils/
    ├── api.js               # API client functions ✅
    └── formatting.js        # Currency & date formatting ✅
```

## Testing the Backend

### Current Setup
```bash
cd backend
source venv/bin/activate
pytest tests/  # Ready for tests to be written
```

### Sample Data Seeding
Once Stage 2 is complete, create a seed script:
```bash
python -m app.scripts.seed_sample_data
```

## Key Technical Decisions

1. **Amounts in Paise**: All monetary values stored as integers (1 rupee = 100 paise) to avoid floating-point precision errors

2. **No LangChain**: Direct provider SDK integration for clear tool execution visibility and control

3. **Single AI Agent**: One agent handles all financial queries with explicit tool calling

4. **JWT Tokens**: 7-day expiration, stored in localStorage on frontend

5. **Encrypted API Keys**: Fernet encryption before database storage, never exposed in API responses

6. **User Data Isolation**: All queries filtered by authenticated user_id

## Environment Variables

**Backend (.env):**
```
DATABASE_URL=sqlite:///./expense_tracker.db
SECRET_KEY=your-secure-key
ENCRYPTION_KEY=your-32-char-encryption-key
FRONTEND_URL=http://localhost:5173
```

**Frontend (vite.config.js):**
- Proxies `/api` to backend
- No environment variables needed (uses relative URLs)

## Common Commands

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt      # Install dependencies
uvicorn app.main:app --reload        # Run development server
python -m pytest                      # Run tests

# Frontend
cd frontend
npm install                          # Install dependencies
npm run dev                          # Development server
npm run build                        # Build for production
npm run preview                      # Preview production build
```

## Debugging Tips

1. **Backend API Docs**: Visit `http://localhost:8000/docs` for interactive documentation
2. **Database Inspection**: SQLite database at `backend/data/expense_tracker.db`
3. **Frontend Console**: Check browser console for React errors
4. **Token Issues**: Clear localStorage if auth appears broken: `localStorage.clear()`

## Next Steps for Implementation

### Immediate (Stage 2)
1. Implement Transaction page UI with CRUD operations
2. Add category management interface
3. Complete Dashboard with real data
4. Implement Budget management page
5. Implement Goals page
6. Add CSV export functionality

### Short Term (Stage 3)
1. Implement affordability calculation services
2. Add EMI calculation backend
3. Create goal recommendation engine

### Medium Term (Stage 4)
1. Implement AI provider abstraction
2. Build tool framework
3. Develop AI financial assistant
4. Add automatic categorization
5. Implement spending analysis

### Long Term (Stage 5)
1. UI/UX refinement
2. Comprehensive testing
3. Performance optimization
4. Mobile responsiveness refinement
5. Production deployment setup

## Support & Resources

- **FastAPI**: https://fastapi.tiangolo.com
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **SQLAlchemy**: https://www.sqlalchemy.org
- **Recharts**: https://recharts.org

---

**Last Updated**: November 2024
**Development Stage**: Foundation (Stage 1) Complete
**Ready for**: Stage 2 Implementation
