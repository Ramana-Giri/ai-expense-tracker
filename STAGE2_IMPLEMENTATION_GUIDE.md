# Stage 2: Transaction Management Implementation Guide

**Stage Status**: Ready to begin
**Estimated Duration**: 4-6 days
**Priority**: High - This is the core expense tracker functionality

## Overview

Stage 2 focuses on implementing the complete Transaction Management page, which is the heart of the expense tracker. Users will be able to add, view, edit, search, and delete transactions with a polished UI.

All backend API endpoints are ready. This stage is purely frontend implementation.

## Components to Build

### 1. Transactions Page (`src/pages/Transactions.jsx`)

#### Features Required
- [ ] Transaction table/list with columns:
  - Date
  - Description
  - Category
  - Amount (with +/- for income/expense)
  - Merchant (optional)
  - Action buttons (edit, delete)

- [ ] Search and filter controls:
  - Search by description/merchant
  - Filter by category dropdown
  - Filter by transaction type (income/expense)
  - Filter by date range (start/end date)
  - Filter by amount range (min/max)

- [ ] Sorting:
  - By date (default: newest first)
  - By amount
  - By category

- [ ] Pagination:
  - Display 20 transactions per page
  - Previous/next buttons
  - Jump to page number

- [ ] Action buttons:
  - Add New Transaction (top right)
  - Edit Transaction (per row)
  - Delete Transaction (per row, with confirmation)
  - Export to CSV (top right)

#### Expected UI Layout
```
┌─────────────────────────────────────────────────────┐
│ Transactions                [Add Transaction] [Export CSV]
├─────────────────────────────────────────────────────┤
│ Search: [_________]  Category: [dropdown]  Type: [Income/Expense]
│ Date From: [_____] To: [_____]  Amount: [Min] - [Max]
├─────────────────────────────────────────────────────┤
│ Date  │ Description │ Category │ Amount  │ Actions  │
├─────────────────────────────────────────────────────┤
│ 20-11 │ Groceries   │ Food     │ -₹500   │ ✎ 🗑    │
│ 19-11 │ Salary      │ Salary   │ +₹50K   │ ✎ 🗑    │
│ ...                                                   │
├─────────────────────────────────────────────────────┤
│ Page 1 of 5  [< Previous]  [Next >]                 │
└─────────────────────────────────────────────────────┘
```

### 2. Transaction Modal (`src/components/TransactionModal.jsx`) - New File

#### Features
- [ ] Form fields:
  - Amount (numeric input, required)
  - Transaction Type (radio: Income/Expense, required)
  - Category (dropdown, required, filters by type)
  - Description (text input, required)
  - Merchant (text input, optional)
  - Transaction Date (date picker, default: today)
  - Payment Method (dropdown, optional)
  - Notes (textarea, optional)

- [ ] Form validation:
  - Amount must be positive number
  - All required fields must be filled
  - Show validation errors clearly
  - Disable submit until valid

- [ ] Two modes:
  - Create new transaction
  - Edit existing transaction

- [ ] API integration:
  - POST for create
  - PUT for update
  - Show loading state
  - Handle errors

#### Example Implementation Structure
```jsx
export default function TransactionModal({ isOpen, onClose, transaction = null, onSuccess }) {
  // State for form fields
  // useEffect to load categories on type change
  // API calls for create/update
  // Form submission handler
}
```

### 3. Delete Confirmation Dialog (`src/components/ConfirmDeleteDialog.jsx`) - New File

#### Features
- [ ] Confirmation dialog with:
  - Title: "Delete Transaction?"
  - Message: "Transaction details" (show date, description, amount)
  - Confirm button (red, destructive style)
  - Cancel button

- [ ] API integration:
  - DELETE request
  - Loading state
  - Success/error handling

### 4. CSV Export Function

#### Features
- [ ] Download file named `transactions_YYYY-MM-DD.csv`
- [ ] Include columns: Date, Description, Category, Type, Amount, Merchant, Payment Method, Notes
- [ ] Format amounts as ₹X,XXX.XX
- [ ] Filter by current search/filters

#### Implementation Approach
```jsx
// Use existing transactionAPI.export() from utils/api.js
// Handle blob response
// Create download link
// Trigger download
```

## Backend API Endpoints Available

### Get Transactions
```
GET /api/transactions?category_id=2&transaction_type=expense&start_date=2024-11-01&end_date=2024-11-30&min_amount=0&max_amount=100000&search_query=food&skip=0&limit=20
```

**Response**: Array of transaction objects

### Create Transaction
```
POST /api/transactions
Body: {
  "amount_paise": 50000,
  "transaction_type": "expense",
  "category_id": 2,
  "description": "Groceries",
  "merchant": "Big Basket",
  "transaction_date": "2024-11-20T10:30:00",
  "payment_method": "Credit Card",
  "notes": "Weekly shopping"
}
```

### Update Transaction
```
PUT /api/transactions/1
Body: { ...fields to update... }
```

### Delete Transaction
```
DELETE /api/transactions/1
```

### Export CSV
```
GET /api/transactions/export/csv?filters...
```

**Response**: CSV file blob

## State Management Plan

### Page-Level State
```jsx
const [transactions, setTransactions] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [currentPage, setCurrentPage] = useState(1)
const [totalPages, setTotalPages] = useState(1)

// Filters
const [filters, setFilters] = useState({
  search_query: '',
  category_id: null,
  transaction_type: null,
  start_date: null,
  end_date: null,
  min_amount: null,
  max_amount: null,
})

// Modal states
const [isModalOpen, setIsModalOpen] = useState(false)
const [editingTransaction, setEditingTransaction] = useState(null)
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const [transactionToDelete, setTransactionToDelete] = useState(null)

// Categories
const [categories, setCategories] = useState([])
```

### Data Flow
1. Component mounts → Load categories and transactions
2. Filter changes → Reload transactions (page 1)
3. Page change → Load transactions for new page
4. Add clicked → Open modal (create mode)
5. Edit clicked → Open modal with transaction data (edit mode)
6. Delete clicked → Show confirmation dialog
7. Confirm delete → Call API, close dialog, reload transactions
8. Form submitted → Call API, close modal, reload transactions

## Implementation Steps

### Step 1: Create Modal Component
- [ ] Create `src/components/TransactionModal.jsx`
- [ ] Build form with all fields
- [ ] Add category filtering based on transaction type
- [ ] Implement form validation
- [ ] Add create/update logic

**Estimated Time**: 2-3 hours

### Step 2: Create Delete Confirmation Dialog
- [ ] Create `src/components/ConfirmDeleteDialog.jsx`
- [ ] Design confirmation UI
- [ ] Implement delete API call
- [ ] Add success/error handling

**Estimated Time**: 1 hour

### Step 3: Build Transactions Page
- [ ] Create `src/pages/Transactions.jsx`
- [ ] Build search/filter controls
- [ ] Implement transaction table
- [ ] Add pagination
- [ ] Integrate modals

**Estimated Time**: 3-4 hours

### Step 4: CSV Export
- [ ] Implement download handler
- [ ] Test export with filters

**Estimated Time**: 30 minutes

### Step 5: Testing & Polish
- [ ] Test all CRUD operations
- [ ] Verify filters work correctly
- [ ] Test pagination
- [ ] Handle edge cases
- [ ] Add loading states and error handling
- [ ] Polish UI and styling

**Estimated Time**: 2-3 hours

## Key Files to Create/Modify

### New Files
- `frontend/src/components/TransactionModal.jsx`
- `frontend/src/components/ConfirmDeleteDialog.jsx`
- `frontend/src/components/FilterControls.jsx` (optional, for reusability)
- `frontend/src/components/TransactionTable.jsx` (optional, for reusability)

### Modified Files
- `frontend/src/pages/Transactions.jsx` - Complete implementation
- `frontend/src/utils/api.js` - May need adjustments
- `frontend/src/App.jsx` - Import new routes (if needed)

## Styling Recommendations

### Colors
- Expense (red): `#ef4444`
- Income (green): `#10b981`
- Neutral: `#6b7280`
- Hover: `#f3f4f6`
- Disabled: `#d1d5db`

### Typography
- Table header: Bold, slightly larger
- Table rows: Normal weight
- Amounts: Monospace for alignment
- Status: Color-coded (green/red)

### Spacing
- Modal padding: 24px
- Form field gap: 16px
- Table row height: 48px
- Button padding: 8px 16px

## API Integration Checklist

- [ ] Load categories on component mount
- [ ] Load transactions with default filters
- [ ] Handle category filtering by type
- [ ] Implement search debouncing (300ms)
- [ ] Handle pagination properly
- [ ] Implement create transaction
- [ ] Implement update transaction
- [ ] Implement delete transaction
- [ ] Implement CSV export
- [ ] Add error handling for all API calls
- [ ] Add loading states
- [ ] Add success notifications

## Error Handling

### Common Scenarios
1. **Network Error**: Show "Failed to load transactions" message
2. **Invalid Date**: Show "Please select a valid date"
3. **Duplicate**: Show "Transaction already exists"
4. **Validation Error**: Show field-specific error messages
5. **Delete Failure**: Show "Could not delete transaction"

### Retry Logic
- Add retry button on error messages
- Auto-retry network failures (max 3 times)

## Performance Optimization

- [ ] Debounce search input (300ms)
- [ ] Debounce filter changes (500ms)
- [ ] Lazy load category dropdown
- [ ] Memoize components (React.memo)
- [ ] Use useCallback for event handlers
- [ ] Consider virtualization for large lists (100+ rows)

## Testing Scenarios

### Test Cases
- [ ] Add expense transaction
- [ ] Add income transaction
- [ ] Edit transaction (change category)
- [ ] Delete transaction (with confirmation)
- [ ] Search by description
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Filter by amount range
- [ ] Export CSV with filters
- [ ] Pagination (move between pages)
- [ ] Sorting (by date, amount)
- [ ] Validation (empty fields, invalid amounts)
- [ ] Error states (network down, server error)

## Acceptance Criteria

### Functional Requirements
- ✅ Users can add new transactions
- ✅ Users can edit existing transactions
- ✅ Users can delete transactions (with confirmation)
- ✅ Users can search transactions
- ✅ Users can filter by category, date, amount
- ✅ Users can export to CSV
- ✅ Pagination works correctly
- ✅ Form validation prevents invalid data
- ✅ Error messages are clear and actionable
- ✅ Loading states visible during API calls

### Non-Functional Requirements
- ✅ Transactions load within 2 seconds
- ✅ Search responds within 500ms
- ✅ CSV exports within 5 seconds
- ✅ UI is responsive on mobile
- ✅ No console errors
- ✅ Accessibility compliant (WCAG AA)

## Next Phase Preview (Stage 2 Continuation)

After transactions are complete, implement:

1. **Dashboard Integration**: Connect real transaction data to charts
2. **Budget Management**: Create budget UI with progress bars
3. **Goals Management**: Goal creation and tracking
4. **Category Management**: Custom categories UI

---

## Getting Started

1. Read this guide completely
2. Review the Transactions.jsx stub file
3. Start with TransactionModal component
4. Build the page step by step
5. Test each feature as you go
6. Update this guide with any issues found

**Happy Coding! 💻**
