import axios from 'axios'

const API_BASE = '/api'

// Transactions
export const transactionAPI = {
  getAll: (filters = {}) => 
    axios.get(`${API_BASE}/transactions`, { params: filters }),
  create: (data) =>
    axios.post(`${API_BASE}/transactions`, data),
  update: (id, data) =>
    axios.put(`${API_BASE}/transactions/${id}`, data),
  delete: (id) =>
    axios.delete(`${API_BASE}/transactions/${id}`),
  export: (filters = {}) =>
    axios.get(`${API_BASE}/transactions/export/csv`, { 
      params: filters,
      responseType: 'blob'
    }),
}

// Categories
export const categoryAPI = {
  getAll: (transactionType = null) =>
    axios.get(`${API_BASE}/categories`, { 
      params: transactionType ? { transaction_type: transactionType } : {}
    }),
  create: (data) =>
    axios.post(`${API_BASE}/categories`, data),
  update: (id, data) =>
    axios.put(`${API_BASE}/categories/${id}`, data),
  delete: (id) =>
    axios.delete(`${API_BASE}/categories/${id}`),
}

// Dashboard
export const dashboardAPI = {
  getSummary: (period = 'this_month') =>
    axios.get(`${API_BASE}/dashboard/summary`, { params: { period } }),
  getSpendingTrend: (period = 'this_month') =>
    axios.get(`${API_BASE}/dashboard/spending-trend`, { params: { period } }),
  getCategoryBreakdown: (period = 'this_month') =>
    axios.get(`${API_BASE}/dashboard/category-breakdown`, { params: { period } }),
  getIncomeVsExpense: (period = 'this_month') =>
    axios.get(`${API_BASE}/dashboard/income-vs-expense`, { params: { period } }),
  getTopCategories: (limit = 5, period = 'this_month') =>
    axios.get(`${API_BASE}/dashboard/top-categories`, { params: { limit, period } }),
  getRecentTransactions: (limit = 5) =>
    axios.get(`${API_BASE}/dashboard/recent-transactions`, { params: { limit } }),
}

// Budgets
export const budgetAPI = {
  getAll: (month = null) =>
    axios.get(`${API_BASE}/budgets`, { params: month ? { month } : {} }),
  create: (data) =>
    axios.post(`${API_BASE}/budgets`, data),
  getStatus: (id) =>
    axios.get(`${API_BASE}/budgets/${id}/status`),
  update: (id, data) =>
    axios.put(`${API_BASE}/budgets/${id}`, data),
  delete: (id) =>
    axios.delete(`${API_BASE}/budgets/${id}`),
}

// Goals
export const goalAPI = {
  getAll: (status = null) =>
    axios.get(`${API_BASE}/goals`, { params: status ? { status_filter: status } : {} }),
  create: (data) =>
    axios.post(`${API_BASE}/goals`, data),
  get: (id) =>
    axios.get(`${API_BASE}/goals/${id}`),
  update: (id, data) =>
    axios.put(`${API_BASE}/goals/${id}`, data),
  delete: (id) =>
    axios.delete(`${API_BASE}/goals/${id}`),
}

// AI
export const aiAPI = {
  chat: (message, conversationHistory = []) =>
    axios.post(`${API_BASE}/ai/chat`, { message, conversation_history: conversationHistory }),
  getSettings: () =>
    axios.get(`${API_BASE}/ai/settings`),
  updateSettings: (data) =>
    axios.post(`${API_BASE}/ai/settings`, data),
  testConnection: () =>
    axios.post(`${API_BASE}/ai/test-connection`),
  deleteKey: () =>
    axios.delete(`${API_BASE}/ai/settings/key`),
}

// Health
export const healthAPI = {
  check: () =>
    axios.get(`${API_BASE}/health`),
}
