import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { goalAPI } from '../utils/api'

export default function GoalModal({ isOpen, onClose, onSuccess, goal = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount_paise: '',
    current_savings_paise: '',
    monthly_contribution_paise: '',
    status: 'active',
    target_date: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Initialize form with goal data if editing
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description || '',
        target_amount_paise: Math.floor(goal.target_amount_paise / 100),
        current_savings_paise: Math.floor(goal.current_savings_paise / 100),
        monthly_contribution_paise: goal.monthly_contribution_paise 
          ? Math.floor(goal.monthly_contribution_paise / 100)
          : '',
        status: goal.status,
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        target_amount_paise: '',
        current_savings_paise: '',
        monthly_contribution_paise: '',
        status: 'active',
        target_date: '',
      })
    }
    setErrors({})
    setSubmitError(null)
  }, [goal, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required'
    }

    if (!formData.target_amount_paise || formData.target_amount_paise <= 0) {
      newErrors.target_amount_paise = 'Target amount must be greater than 0'
    }

    if (formData.current_savings_paise && formData.current_savings_paise > formData.target_amount_paise) {
      newErrors.current_savings_paise = 'Current savings cannot exceed target amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['target_amount_paise', 'current_savings_paise', 'monthly_contribution_paise'].includes(name)
        ? (value ? parseInt(value) : '')
        : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setSubmitError(null)

      const payload = {
        name: formData.name,
        description: formData.description || null,
        target_amount_paise: formData.target_amount_paise * 100,
        current_savings_paise: formData.current_savings_paise * 100 || 0,
        monthly_contribution_paise: formData.monthly_contribution_paise 
          ? formData.monthly_contribution_paise * 100 
          : null,
        status: formData.status,
        target_date: formData.target_date || null,
      }

      if (goal) {
        // API call for update
        console.log('Updating goal:', goal.id, payload)
        await goalAPI.update(goal.id, payload)
      } else {
        // API call for create
        console.log('Creating goal:', payload)
        await goalAPI.create(payload)
      }

      onSuccess()
    } catch (err) {
      console.error('Error saving goal:', err)
      setSubmitError(err.response?.data?.message || 'Failed to save goal')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {goal ? 'Edit Goal' : 'Create Goal'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {submitError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Emergency Fund, Vacation"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add notes about this goal..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount (₹) *
            </label>
            <input
              type="number"
              name="target_amount_paise"
              value={formData.target_amount_paise}
              onChange={handleChange}
              placeholder="0"
              step="1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.target_amount_paise ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.target_amount_paise && (
              <p className="text-red-500 text-sm mt-1">{errors.target_amount_paise}</p>
            )}
          </div>

          {/* Current Savings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Savings (₹)
            </label>
            <input
              type="number"
              name="current_savings_paise"
              value={formData.current_savings_paise}
              onChange={handleChange}
              placeholder="0"
              step="1"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.current_savings_paise ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.current_savings_paise && (
              <p className="text-red-500 text-sm mt-1">{errors.current_savings_paise}</p>
            )}
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Contribution (₹)
            </label>
            <input
              type="number"
              name="monthly_contribution_paise"
              value={formData.monthly_contribution_paise}
              onChange={handleChange}
              placeholder="0"
              step="1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Date
            </label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
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
              {loading ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
