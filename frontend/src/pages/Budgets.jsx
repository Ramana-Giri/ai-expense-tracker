import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { budgetAPI, categoryAPI } from '../utils/api'
import { formatCurrency } from '../utils/formatting'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    category_id: null,
    amount_paise: '',
    month: selectedMonth,
  })

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [budgetsRes, categoriesRes] = await Promise.all([
        budgetAPI.getAll(selectedMonth),
        categoryAPI.getAll(),
      ])

      setBudgets(budgetsRes.data)
      setCategories(categoriesRes.data)
    } catch (err) {
      console.error('Error loading budgets:', err)
      setError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()

    if (!formData.amount_paise) {
      setError('Please enter an amount')
      return
    }

    try {
      // API call would go here
      console.log('Adding budget:', formData)
      setFormData({ category_id: null, amount_paise: '', month: selectedMonth })
      setIsModalOpen(false)
      await loadData()
    } catch (err) {
      setError('Failed to add budget')
    }
  }

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Delete this budget?')) return

    try {
      await budgetAPI.delete(budgetId)
      console.log('Deleting budget:', budgetId)
      await loadData()
    } catch (err) {
      setError('Failed to delete budget')
    }
  }

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || 'Overall'
  }

  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    if (percentage < 100) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading budgets...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          <Plus size={18} />
          Add Budget
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Budgets Grid */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map(budget => (
            <div key={budget.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getCategoryName(budget.category_id)}
                  </h3>
                  <p className="text-sm text-gray-600">Budget for {selectedMonth}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget Amount</span>
                  <span className="font-semibold">{formatCurrency(budget.amount_paise)}</span>
                </div>

                {/* Progress Bar (showing 0% for now - needs data) */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold">₹0 / {formatCurrency(budget.amount_paise)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">0% used</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-600">
          <p className="text-lg">No budgets for {selectedMonth}</p>
          <p className="text-sm mt-2">Create your first budget to track spending!</p>
        </div>
      )}

      {/* Add Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Budget</h2>

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Overall Budget</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount_paise}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount_paise: e.target.value }))}
                  placeholder="0.00"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
