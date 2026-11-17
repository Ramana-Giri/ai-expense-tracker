import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Download } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import { transactionAPI, categoryAPI } from '../utils/api'
import { formatCurrency } from '../utils/formatting'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals and dialogs
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, transaction: null })

  // Filters
  const [filters, setFilters] = useState({
    transaction_type: '',
    category_id: '',
    search_query: '',
    min_amount: '',
    max_amount: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [categoriesRes, transactionsRes] = await Promise.all([
        categoryAPI.getAll(),
        transactionAPI.getAll(),
      ])

      setAllCategories(categoriesRes.data)
      setTransactions(transactionsRes.data)
      setCurrentPage(1)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load transactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    if (filters.transaction_type && txn.transaction_type !== filters.transaction_type) return false
    if (filters.category_id && txn.category_id !== parseInt(filters.category_id)) return false
    if (filters.search_query) {
      const query = filters.search_query.toLowerCase()
      const matches = 
        txn.description.toLowerCase().includes(query) ||
        (txn.merchant && txn.merchant.toLowerCase().includes(query))
      if (!matches) return false
    }
    if (filters.min_amount && txn.amount_paise < parseInt(filters.min_amount) * 100) return false
    if (filters.max_amount && txn.amount_paise > parseInt(filters.max_amount) * 100) return false
    return true
  }).sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIdx, startIdx + itemsPerPage)

  const handleAddClick = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (transaction) => {
    setDeleteDialog({ isOpen: true, transaction })
  }

  const handleModalSuccess = async (data) => {
    try {
      if (editingTransaction) {
        // Update transaction (API call would go here in Stage 2)
        console.log('Updating transaction:', editingTransaction.id, data)
        await transactionAPI.update(editingTransaction.id, data)
      } else {
        // Create transaction (API call would go here in Stage 2)
        console.log('Creating transaction:', data)
        await transactionAPI.create(data)
      }
      // Reload transactions
      await loadData()
    } catch (err) {
      console.error('Error saving transaction:', err)
      setError('Failed to save transaction')
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await transactionAPI.delete(deleteDialog.transaction.id)
      console.log('Deleting transaction:', deleteDialog.transaction.id)
      await loadData()
      setDeleteDialog({ isOpen: false, transaction: null })
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setError('Failed to delete transaction')
    }
  }

  const handleExportCSV = async () => {
    try {
      // const response = await transactionAPI.export(filters)
      // Create download link
      console.log('Exporting CSV with filters:', filters)
      setError('CSV export coming soon!')
    } catch (err) {
      console.error('Error exporting:', err)
      setError('Failed to export transactions')
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading transactions...</div>
      </div>
    )
  }

  const getCategoryName = (categoryId) => {
    return allCategories.find(c => c.id === categoryId)?.name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            name="search_query"
            placeholder="Search description/merchant"
            value={filters.search_query}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="transaction_type"
            value={filters.transaction_type}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            name="category_id"
            value={filters.category_id}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input
            type="number"
            name="min_amount"
            placeholder="Min amount"
            value={filters.min_amount}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            name="max_amount"
            placeholder="Max amount"
            value={filters.max_amount}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginatedTransactions.length > 0 ? (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(txn.transaction_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{txn.description}</div>
                      <div className="text-sm text-gray-500">{txn.merchant || '—'}</div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {getCategoryName(txn.category_id)}
                    </td>
                    <td className={`px-6 py-3 font-semibold ${
                      txn.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.transaction_type === 'income' ? '+' : '−'} {formatCurrency(txn.amount_paise)}
                    </td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleEditClick(txn)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Edit2 size={16} className="inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(txn)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        <Trash2 size={16} className="inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="flex items-center px-3 py-1 text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-gray-600">
            <p className="text-lg">No transactions found</p>
            <p className="text-sm mt-2">Add your first transaction to get started!</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTransaction(null)
        }}
        onSuccess={handleModalSuccess}
        transaction={editingTransaction}
        allCategories={allCategories}
      />

      <ConfirmDeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, transaction: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction?"
        message={deleteDialog.transaction ? 
          `Delete "${deleteDialog.transaction.description}"? This action cannot be undone.` : 
          'Are you sure?'
        }
      />
    </div>
  )
}
