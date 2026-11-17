import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Target } from 'lucide-react'
import { goalAPI } from '../utils/api'
import { formatCurrency } from '../utils/formatting'
import GoalModal from '../components/GoalModal'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals and dialogs
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, goal: null })

  // Load data
  useEffect(() => {
    loadGoals()
  }, [statusFilter])

  const loadGoals = async () => {
    try {
      setLoading(true)
      setError(null)

      const filter = statusFilter !== 'all' ? statusFilter : null
      const res = await goalAPI.getAll(filter)
      setGoals(res.data || [])
    } catch (err) {
      console.error('Error loading goals:', err)
      setError('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (goal) => {
    setDeleteDialog({ isOpen: true, goal })
  }

  const handleConfirmDelete = async () => {
    try {
      await goalAPI.delete(deleteDialog.goal.id)
      setDeleteDialog({ isOpen: false, goal: null })
      await loadGoals()
    } catch (err) {
      console.error('Error deleting goal:', err)
      setError('Failed to delete goal')
      setDeleteDialog({ isOpen: false, goal: null })
    }
  }

  const handleModalSuccess = async () => {
    setIsModalOpen(false)
    await loadGoals()
  }

  const getProgressPercentage = (goal) => {
    if (!goal.target_amount_paise || goal.target_amount_paise === 0) return 0
    return Math.min((goal.current_savings_paise / goal.target_amount_paise) * 100, 100)
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getProgressColor = (percentage) => {
    if (percentage < 25) return 'bg-red-500'
    if (percentage < 50) return 'bg-yellow-500'
    if (percentage < 75) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getRemainingAmount = (goal) => {
    const remaining = goal.target_amount_paise - goal.current_savings_paise
    return Math.max(remaining, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading goals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600 mt-1">Track and manage your financial goals</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          New Goal
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'completed', 'paused', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No goals yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first financial goal to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const progress = getProgressPercentage(goal)
            const remaining = getRemainingAmount(goal)

            return (
              <div key={goal.id} className="bg-white rounded-lg shadow p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(goal)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit goal"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(goal)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  {getStatusBadge(goal.status)}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${getProgressColor(progress)} h-3 rounded-full transition-all`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Amount Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Saved</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(goal.current_savings_paise)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Target</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(goal.target_amount_paise)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remaining */}
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600">
                    Remaining: <span className="font-bold text-gray-900">{formatCurrency(remaining)}</span>
                  </p>
                </div>

                {/* Monthly Contribution */}
                {goal.monthly_contribution_paise > 0 && (
                  <div className="border-t mt-3 pt-3">
                    <p className="text-sm text-gray-600">
                      Monthly contribution: <span className="font-medium text-gray-900">
                        {formatCurrency(goal.monthly_contribution_paise)}
                      </span>
                    </p>
                  </div>
                )}

                {/* Deadline */}
                {goal.target_date && (
                  <div className="border-t mt-3 pt-3">
                    <p className="text-sm text-gray-600">
                      Target date: <span className="font-medium text-gray-900">
                        {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          goal={editingGoal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, goal: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteDialog.goal?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
