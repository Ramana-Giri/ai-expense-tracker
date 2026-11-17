# AI-Powered Personal Finance and Expense Tracker

A complete full-stack application combining a conventional expense tracker with an AI financial assistant. Manage your finances with intelligent insights and natural-language financial queries.

## Features

### Expense Tracker
- ✅ Add, edit, delete transactions
- ✅ Categorize income and expenses
- ✅ Track monthly budgets
- ✅ Create and monitor financial goals
- ✅ View spending analytics and trends
- ✅ Export transaction data to CSV
- ✅ Multi-period reporting (month, quarter, year)

### AI Financial Assistant
- 🤖 Natural-language expense entry
- 🤖 Automatic expense categorization
- 🤖 Spending pattern analysis
- 🤖 Financial relationship analysis
- 🤖 Purchase affordability analysis
- 🤖 EMI vs cash payment comparison
- 🤖 Savings goal planning

### Dashboard
- Professional SaaS-style layout
- Real-time financial summaries
- Interactive charts and graphs
- Recent transactions view
- Budget status tracking
- Category-wise breakdowns

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **Encryption**: Fernet for API key storage
- **Python Version**: 3.11+

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6

### AI Integration
- Google Gemini
- OpenAI GPT
- Anthropic Claude
- Direct provider SDK integration (no LangChain)

## Project Structure

```
ai-expense-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # Database setup
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── security.py          # Auth and encryption
│   │   ├── encryption.py        # Fernet encryption
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── transactions.py
│   │   │   ├── categories.py
│   │   │   ├── dashboard.py
│   │   │   ├── budgets.py
│   │   │   ├── goals.py
│   │   │   └── ai.py
│   │   └── tests/               # Unit tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/               # React pages
│   │   ├── layouts/             # Layout components
│   │   ├── context/             # Auth context
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   DATABASE_URL=sqlite:///./expense_tracker.db
   SECRET_KEY=your-secure-secret-key-here
   ENCRYPTION_KEY=your-encryption-key-32-chars-long
   FRONTEND_URL=http://localhost:5173
   ```

5. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Running Both Services

### Option 1: Separate terminals

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Option 2: Using concurrently (from root directory)

```bash
npm install -g concurrently
concurrently "cd backend && source venv/bin/activate && uvicorn app.main:app --reload" "cd frontend && npm run dev"
```

## Database

The application uses SQLite by default. The database file will be created automatically:
```
backend/data/expense_tracker.db
```

### Database Tables

- **users**: User accounts with authentication
- **categories**: Income and expense categories
- **transactions**: Financial transactions
- **budgets**: Monthly budgets
- **financial_goals**: Savings goals tracking
- **ai_settings**: AI provider configuration

All monetary amounts are stored as **paise** (1 rupee = 100 paise) to avoid floating-point precision errors.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/{id}` - Get transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/export/csv` - Export CSV

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Dashboard
- `GET /api/dashboard/summary` - Financial summary
- `GET /api/dashboard/spending-trend` - Spending over time
- `GET /api/dashboard/category-breakdown` - Expenses by category
- `GET /api/dashboard/income-vs-expense` - Monthly comparison
- `GET /api/dashboard/top-categories` - Top spending categories
- `GET /api/dashboard/recent-transactions` - Recent transactions

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/{id}/status` - Budget status
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Goals
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `GET /api/goals/{id}` - Get goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal

### AI
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/settings` - Get AI settings
- `POST /api/ai/settings` - Configure AI provider
- `POST /api/ai/test-connection` - Test AI connection
- `DELETE /api/ai/settings/key` - Delete API key

## Configuration

### AI Provider Setup

1. **Navigate to Settings** from the application
2. **Select your AI provider**: Google Gemini, OpenAI, or Anthropic Claude
3. **Enter API Key**: Your provider's API key (encrypted before storage)
4. **Select Model**: Choose from available models
5. **Test Connection**: Verify the configuration works

API keys are:
- Encrypted before storage
- Never exposed in API responses
- Never logged or displayed in the UI
- Stored only on the server

### Adding Sample Data

The application creates default categories on user registration. To add sample data:

1. Register a new user
2. Use the Transactions page to manually add transactions
3. Or create sample data script (coming in Stage 5)

## Development Stages

This project was built in structured stages:

### Stage 1: Foundation ✅
- Project structure and configuration
- FastAPI and React setup
- Authentication system
- Database models

### Stage 2: Expense Tracker ✅
- Transactions management
- Categories
- Dashboard with analytics
- Budget tracking
- Financial goals
- CSV export

### Stage 3: AI Integration (In Progress)
- AI provider abstraction
- Tool calling mechanism
- Natural-language processing
- Expense categorization
- Financial analysis tools

### Stage 4: Polish & Testing
- Error handling
- User feedback
- Performance optimization
- Comprehensive testing

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Build

```bash
cd frontend
npm run build
```

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ API key encryption with Fernet
- ✅ CORS configuration
- ✅ User data isolation
- ✅ Input validation with Pydantic
- ✅ SQL injection prevention via ORM
- ✅ Secure credential management

## Limitations & Future Enhancements

- Single AI agent (no multiple agents)
- SQLite database (suitable for personal use)
- No multi-currency support yet
- No data synchronization across devices
- No mobile app yet

## Support

For issues or questions:
1. Check existing documentation
2. Review API documentation at `/docs` after running backend
3. Check browser console for frontend errors
4. Review backend logs in terminal

## License

MIT License - feel free to use and modify for personal use.

## Disclaimer

This is a personal finance application. While it provides useful insights, always consult with a qualified financial advisor for major financial decisions. The AI assistant provides suggestions only and should not be considered professional financial advice.
