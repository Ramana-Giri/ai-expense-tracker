import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, CreditCard } from 'lucide-react'

const DEFAULT_PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'UPI',
  'Bank Transfer',
  'Cheque',
  'Other'
]

export default function Accounts() {
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS)
  const [newMethod, setNewMethod] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingValue, setEditingValue] = useState('')

  // Load custom payment methods from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('paymentMethods')
    if (saved) {
      setPaymentMethods(JSON.parse(saved))
    }
  }, [])

  const saveToLocalStorage = (methods) => {
    localStorage.setItem('paymentMethods', JSON.stringify(methods))
  }

  const handleAddMethod = () => {
    if (!newMethod.trim()) return
    
    if (paymentMethods.includes(newMethod)) {
      alert('This payment method already exists')
      return
    }

    const updated = [...paymentMethods, newMethod.trim()]
    setPaymentMethods(updated)
    saveToLocalStorage(updated)
    setNewMethod('')
  }

  const handleDeleteMethod = (index) => {
    if (DEFAULT_PAYMENT_METHODS.includes(paymentMethods[index])) {
      alert('Cannot delete default payment methods')
      return
    }

    const updated = paymentMethods.filter((_, i) => i !== index)
    setPaymentMethods(updated)
    saveToLocalStorage(updated)
  }

  const handleEditStart = (index) => {
    setEditingIndex(index)
    setEditingValue(paymentMethods[index])
  }

  const handleEditSave = (index) => {
    if (!editingValue.trim()) return
    
    const updated = [...paymentMethods]
    updated[index] = editingValue.trim()
    setPaymentMethods(updated)
    saveToLocalStorage(updated)
    setEditingIndex(null)
    setEditingValue('')
  }

  const handleEditCancel = () => {
    setEditingIndex(null)
    setEditingValue('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Accounts & Payment Methods</h1>
        <p className="text-gray-600 mt-1">Manage your payment methods and accounts</p>
      </div>

      {/* Add New Payment Method */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Payment Method</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMethod()}
            placeholder="e.g., Amazon Pay, Wallet, etc."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddMethod}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Payment Methods</h2>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No payment methods configured</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paymentMethods.map((method, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-blue-600" />
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">{method}</p>
                      {DEFAULT_PAYMENT_METHODS.includes(method) && (
                        <p className="text-xs text-gray-500">Default</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingIndex === index ? (
                    <>
                      <button
                        onClick={() => handleEditSave(index)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {!DEFAULT_PAYMENT_METHODS.includes(method) && (
                        <>
                          <button
                            onClick={() => handleEditStart(index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMethod(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Custom payment methods you add here will appear in the transaction form. Default methods cannot be deleted.
        </p>
      </div>
    </div>
  )
}
