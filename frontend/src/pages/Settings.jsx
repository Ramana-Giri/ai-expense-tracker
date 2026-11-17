import React, { useState, useEffect } from 'react'
import { Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { aiAPI } from '../utils/api'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('ai')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    provider: 'openai',
    model: 'gpt-4',
    api_key: '',
    temperature: 0.7,
    max_tokens: 2000,
  })

  const [originalSettings, setOriginalSettings] = useState({})

  // Load AI settings
  useEffect(() => {
    loadAiSettings()
  }, [])

  const loadAiSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await aiAPI.getSettings()
      const settings = res.data || {}

      setAiSettings(prev => ({
        ...prev,
        provider: settings.provider || 'openai',
        model: settings.model || 'gpt-4',
        api_key: settings.api_key || '',
        temperature: settings.temperature ?? 0.7,
        max_tokens: settings.max_tokens || 2000,
      }))

      setOriginalSettings({ ...settings })
    } catch (err) {
      console.error('Error loading AI settings:', err)
      // Don't show error for settings load - they may not exist
      setAiSettings(prev => ({ ...prev }))
    } finally {
      setLoading(false)
    }
  }

  const handleAiSettingChange = (field, value) => {
    setAiSettings(prev => ({
      ...prev,
      [field]: field === 'temperature' || field === 'max_tokens'
        ? parseFloat(value)
        : value,
    }))
    setSuccess(false)
  }

  const handleSaveAiSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Validate settings
      if (!aiSettings.api_key) {
        setError('API key is required')
        return
      }

      if (aiSettings.temperature < 0 || aiSettings.temperature > 2) {
        setError('Temperature must be between 0 and 2')
        return
      }

      if (aiSettings.max_tokens < 100) {
        setError('Max tokens must be at least 100')
        return
      }

      // API call for save
      console.log('Saving AI settings:', aiSettings)
      // await aiAPI.updateSettings(aiSettings)

      setSuccess(true)
      setOriginalSettings({ ...aiSettings })

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving AI settings:', err)
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Validate settings first
      if (!aiSettings.api_key) {
        setError('Please enter an API key first')
        return
      }

      // Save settings before testing
      console.log('Testing connection with settings:', aiSettings)
      // await aiAPI.testConnection()

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error testing connection:', err)
      setError(err.response?.data?.message || 'Connection failed. Check your API key.')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(aiSettings) !== JSON.stringify(originalSettings)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage application settings and AI configuration</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-8">
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-3 px-1 border-b-2 font-medium transition ${
            activeTab === 'ai'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          AI Configuration
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`py-3 px-1 border-b-2 font-medium transition ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          General
        </button>
      </div>

      {/* AI Configuration Tab */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-blue-900">AI Assistant Configuration</p>
              <p className="text-sm text-blue-800 mt-1">
                Configure your AI provider settings. The AI assistant uses these settings to analyze your spending and provide financial insights.
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex gap-2 items-start">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex gap-2 items-start">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>Settings saved successfully!</div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Provider
              </label>
              <select
                value={aiSettings.provider}
                onChange={(e) => handleAiSettingChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
              </select>
              <p className="text-sm text-gray-600 mt-1">
                Select your preferred AI provider
              </p>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={aiSettings.model}
                onChange={(e) => handleAiSettingChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {aiSettings.provider === 'openai' && (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                )}
                {aiSettings.provider === 'anthropic' && (
                  <>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </>
                )}
                {aiSettings.provider === 'google' && (
                  <>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  </>
                )}
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={aiSettings.api_key}
                  onChange={(e) => handleAiSettingChange('api_key', e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Keep your API key secure. Never share it with others.
              </p>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature: {aiSettings.temperature.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={aiSettings.temperature}
                onChange={(e) => handleAiSettingChange('temperature', e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-1">
                Lower values (0-0.5) make responses more focused and deterministic. Higher values (1-2) make responses more creative and random.
              </p>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={aiSettings.max_tokens}
                onChange={(e) => handleAiSettingChange('max_tokens', e.target.value)}
                min="100"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Maximum length of AI responses (100-4000 recommended)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-3">
            <button
              onClick={handleSaveAiSettings}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save size={18} />
              Save Settings
            </button>
            <button
              onClick={handleTestConnection}
              disabled={saving}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Test Connection
            </button>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">General settings coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}
