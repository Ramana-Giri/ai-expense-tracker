import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { transactionAPI } from '../utils/api'

// Default payment methods
const DEFAULT_PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'UPI',
  'Bank Transfer',
  'Cheque',
  'Other'
]

export default function TransactionModal({ isOpen, onClose, onSuccess, transaction = null, allCategories = [] }) {
  const [formData, setFormData] = useState({
    amount_paise: '',
    transaction_type: 'expense',
    category_id: '',
    description: '',
    merchant: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS)

  // Load payment methods from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('paymentMethods')
    if (saved) {
      try {
        setPaymentMethods(JSON.parse(saved))
      } catch {
        setPaymentMethods(DEFAULT_PAYMENT_METHODS)
      }
    }
  }, [isOpen])

  // Set up form data when editing or modal opens
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setFormData({
          amount_paise: Math.floor(transaction.amount_paise / 100),
          transaction_type: transaction.transaction_type,
          category_id: transaction.category_id,
          description: transaction.description,
          merchant: transaction.merchant || '',
          transaction_date: transaction.transaction_date.split('T')[0],
          payment_method: transaction.payment_method || 'Cash',
          notes: transaction.notes || '',
        })
      } else {
        setFormData(prev => ({
          ...prev,
          amount_paise: '',
          category_id: '',
          description: '',
          merchant: '',
          transaction_date: new Date().toISOString().split('T')[0],
          payment_method: 'Cash',
          notes: '',
        }))
      }
      setErrors({})
    }
  }, [transaction, isOpen])

  // Filter categories by transaction type
  useEffect(() => {
    if (!isOpen) return
    
    const filtered = allCategories.filter(cat => cat.transaction_type === formData.transaction_type)
    setFilteredCategories(filtered)
    
    // Auto-select first category if none selected and categories available
    if (filtered.length > 0 && !formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: filtered[0].id }))
    }
  }, [formData.transaction_type, allCategories, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount_paise || formData.amount_paise <= 0) {
      newErrors.amount_paise = 'Amount must be greater than 0'
    }

    if (!formData.category_id || formData.category_id === '') {
      newErrors.category_id = 'Category is required'
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'amount_paise') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : '',
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const categoryId = parseInt(formData.category_id)
      
      if (isNaN(categoryId)) {
        setErrors({ submit: 'Invalid category selected' })
        setLoading(false)
        return
      }

      const submitData = {
        amount_paise: Math.floor(formData.amount_paise * 100),
        category_id: categoryId,
        transaction_type: formData.transaction_type,
        description: formData.description.trim(),
        merchant: formData.merchant.trim() || undefined,
        transaction_date: new Date(formData.transaction_date).toISOString(),
        payment_method: formData.payment_method || undefined,
        notes: formData.notes.trim() || undefined,
      }

      console.log('Submitting transaction:', submitData)

      if (transaction) {
        await transactionAPI.update(transaction.id, submitData)
        console.log('Transaction updated successfully')
      } else {
        const response = await transactionAPI.create(submitData)
        console.log('Transaction created successfully:', response.data)
      }

      setFormData({
        amount_paise: '',
        transaction_type: 'expense',
        category_id: '',
        description: '',
        merchant: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        notes: '',
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error submitting transaction:', error.response?.data || error)
      
      let errorMessage = 'Failed to save transaction'
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0]?.msg || 'Validation error'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              <strong>Error:</strong> {errors.submit}
            </div>
          )}

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="transaction_type"
                  value="expense"
                  checked={formData.transaction_type === 'expense'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Expense</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="transaction_type"
                  value="income"
                  checked={formData.transaction_type === 'income'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Income</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              name="amount_paise"
              value={formData.amount_paise}
              onChange={handleChange}
              placeholder="0.00"
              step="1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount_paise ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount_paise && <p className="text-red-500 text-xs mt-1">{errors.amount_paise}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {filteredCategories.length > 0 ? (
                filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled>No {formData.transaction_type} categories</option>
              )}
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Lunch at restaurant"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
            <input
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              placeholder="e.g., XYZ Restaurant"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Method - DROPDOWN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Manage payment methods in Accounts</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (transaction ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
