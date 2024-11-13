'use client'
import { useState, useEffect } from 'react'
import { marked } from 'marked'  // To convert Markdown to HTML for live preview
import { Highlight } from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { FaCheckCircle, FaHistory, FaTrashAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Home() {
  const [markdown, setMarkdown] = useState('')
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [store, setStore] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [history, setHistory] = useState([])

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/convert?markdown=${encodeURIComponent(markdown)}&css=${encodeURIComponent(css)}&store=${store}&key=${customKey}&history=true`)
      if (!res.ok) {
        throw new Error('Failed to convert markdown')
      }
      const historyData = await res.json()
      setHistory(historyData)  // Update history list
      const htmlResult = await res.text()
      setHtml(htmlResult)
    } catch (error) {
      setError('Error converting markdown')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMarkdown('')
    setHtml('')
    setCss('')
    setStore(false)
    setCustomKey('')
    setError('')
  }

  const handleClearHistory = async () => {
    try {
      const res = await fetch(`/api/convert?history=true`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to clear history')
      }
      setHistory([])  // Clear local history
    } catch (error) {
      setError('Error clearing history')
    }
  }

  useEffect(() => {
    // Optional: You could load history from the KV store when the page loads
    const loadHistory = async () => {
      const res = await fetch('/api/convert?history=true')
      if (res.ok) {
        const historyData = await res.json()
        setHistory(historyData)
      }
    }
    loadHistory()
  }, [])

  return (
    <div className="flex flex-col items-center p-6 space-y-4 max-w-4xl mx-auto">
      <motion.h1
        className="text-3xl font-semibold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Markdown to HTML Converter
      </motion.h1>

      <motion.textarea
        rows="8"
        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Enter your Markdown here..."
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      <motion.textarea
        rows="4"
        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        value={css}
        onChange={(e) => setCss(e.target.value)}
        placeholder="Optional: Add custom CSS for the HTML preview..."
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      />

      <div className="flex items-center space-x-4">
        <label className="text-sm">Store HTML:</label>
        <input
          type="checkbox"
          checked={store}
          onChange={() => setStore(!store)}
          className="w-5 h-5"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="text-sm">Custom Key:</label>
        <input
          type="text"
          value={customKey}
          onChange={(e) => setCustomKey(e.target.value)}
          className="p-2 border rounded-md"
          placeholder="Optional: Custom Key for storage"
        />
      </div>

      <div className="flex space-x-4">
        <motion.button
          onClick={handleConvert}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          whileHover={{ scale: 1.1 }}
        >
          {loading ? 'Converting...' : 'Convert to HTML'}
        </motion.button>
        <motion.button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          whileHover={{ scale: 1.1 }}
        >
          Clear
        </motion.button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <h2 className="text-2xl font-semibold mt-6">Converted HTML Preview</h2>
      <motion.div
        className="w-full mt-4 p-4 border border-gray-300 rounded-md"
        style={{ minHeight: '200px', whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: html }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      ></motion.div>

      <h2 className="text-2xl font-semibold mt-6">History</h2>
      <div className="w-full mt-4 space-y-2">
        {history.length > 0 ? (
          history.map((entry, idx) => (
            <motion.div
              key={idx}
              className="border-b p-2 flex flex-col space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="font-semibold">Converted at {new Date(entry.timestamp).toLocaleString()}</div>
              <div className="text-gray-600">
                <strong>Markdown:</strong> {entry.markdown.slice(0, 50)}...
              </div>
              <div className="text-gray-600">
                <strong>HTML:</strong> {entry.htmlContent.slice(0, 50)}...
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-gray-600">No history available.</div>
        )}
      </div>

      <motion.button
        onClick={handleClearHistory}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        whileHover={{ scale: 1.1 }}
      >
        <FaTrashAlt className="inline mr-2" />
        Clear History
      </motion.button>
    </div>
  )
}
