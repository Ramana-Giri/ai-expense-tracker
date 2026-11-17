import React, { useState, useEffect } from 'react'
import { dashboardAPI, transactionAPI } from '../utils/api'
import { formatCurrency } from '../utils/formatting'
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export default function Dashboard() {
  const [period, setPeriod] = useState('this_month')
  const [summary, setSummary] = useState(null)
  const [spendingTrend, setSpendingTrend] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [period])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        summaryRes,
        trendRes,
        categoryRes,
        recentRes,
      ] = await Promise.all([
        dashboardAPI.getSummary(period),
        dashboardAPI.getSpendingTrend(period),
        dashboardAPI.getCategoryBreakdown(period),
        dashboardAPI.getRecentTransactions(10),
      ])

      setSummary(summaryRes.data)
      setSpendingTrend(trendRes.data)
      setCategoryBreakdown(categoryRes.data)
      setRecentTransactions(recentRes.data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="last_6_months">Last 6 Months</option>
          <option value="this_year">This Year</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.total_income_paise)}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.total_expenses_paise)}
                </p>
              </div>
              <TrendingDown className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Net Balance</p>
                <p className={`text-2xl font-bold ${summary.net_balance_paise >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.net_balance_paise)}
                </p>
              </div>
              <DollarSign className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.estimated_savings_paise)}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Savings Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.savings_rate}%
                </p>
              </div>
              <PieChart className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Chart */}
        {spendingTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income_paise"
                  stroke="#10b981"
                  name="Income"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expense_paise"
                  stroke="#ef4444"
                  name="Expenses"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Breakdown Pie Chart */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie data={categoryBreakdown} dataKey="amount_paise" nameKey="category">
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Tooltip formatter={(value) => `₹${(value / 100).toFixed(2)}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <a href="/transactions" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
            View All →
          </a>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Category</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.slice(0, 5).map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(txn.transaction_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{txn.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{txn.category?.name || 'N/A'}</td>
                    <td className={`py-3 px-4 text-sm font-semibold text-right ${
                      txn.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.transaction_type === 'income' ? '+' : '-'} ₹{(txn.amount_paise / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No transactions yet. Start by adding one!</p>
        )}
      </div>
    </div>
  )
}
