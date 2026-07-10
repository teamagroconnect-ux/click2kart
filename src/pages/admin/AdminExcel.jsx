import { useState, useEffect, useCallback, useRef } from 'react'
import Spreadsheet from 'react-spreadsheet'
import * as XLSX from 'xlsx'
import api from '../../lib/api'

// Add styles for react-spreadsheet
const spreadsheetStyles = `
  .Spreadsheet {
    width: 100% !important;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
  }

  .Spreadsheet .Table {
    border-collapse: collapse;
    width: 100%;
  }

  .Spreadsheet .Table td,
  .Spreadsheet .Table th {
    border: 1px solid #e0e0e0;
    padding: 8px 12px;
    min-width: 100px;
    height: 36px;
    position: relative;
  }

  .Spreadsheet .Table th {
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    color: #495057;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .Spreadsheet .Table td:first-child,
  .Spreadsheet .Table th:first-child {
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
    color: #495057;
    text-align: center;
    position: sticky;
    left: 0;
    z-index: 5;
  }

  .Spreadsheet .Table td:hover,
  .Spreadsheet .Table th:hover {
    background: #f0f7ff;
  }

  .Spreadsheet .Editable {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    outline: none;
  }

  .Spreadsheet .Selected {
    box-shadow: inset 0 0 0 2px #2563eb;
    background: #eff6ff !important;
  }

  .Spreadsheet input.Editable:focus {
    box-shadow: inset 0 0 0 2px #2563eb;
  }
`

export default function AdminExcel() {
  const [data, setData] = useState([
    ['Item', 'Quantity', 'Price', 'Total'],
    ['', '', '', '']
  ])
  const [fileName, setFileName] = useState('admin-data')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const debounceRef = useRef(null)
  const fileInputRef = useRef(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Load data from server on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/api/admin/excel')
        if (res.data.data) {
          setData(res.data.data)
          setHistory([res.data.data])
          setHistoryIndex(0)
        }
        if (res.data.fileName) setFileName(res.data.fileName)
      } catch (err) {
        console.error('Failed to load Excel data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Save data to history for undo/redo
  const saveToHistory = useCallback((newData) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newData)
    if (newHistory.length > 50) newHistory.shift() // Keep last 50 history items
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      const prevData = history[newIndex]
      setData(prevData)
      saveData(prevData, fileName)
    }
  }, [historyIndex, history, fileName])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const nextData = history[newIndex]
      setData(nextData)
      saveData(nextData, fileName)
    }
  }, [historyIndex, history, fileName])

  // Save data to server with debounce
  const saveData = useCallback(async (newData, newFileName) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Set new debounce
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await api.put('/api/admin/excel', {
          data: newData,
          fileName: newFileName
        })
        setLastSaved(new Date())
      } catch (err) {
        console.error('Failed to save Excel data:', err)
      } finally {
        setSaving(false)
      }
    }, 800)
  }, [])

  const handleDataChange = (newData) => {
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName)
  }

  const handleFileNameChange = (e) => {
    const newName = e.target.value
    setFileName(newName)
    saveData(data, newName)
  }

  // Add new row
  const addRow = () => {
    const newRow = new Array(data[0]?.length || 4).fill('')
    const newData = [...data, newRow]
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName)
  }

  // Delete last row
  const deleteRow = () => {
    if (data.length <= 1) return
    const newData = data.slice(0, -1)
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName)
  }

  // Add new column
  const addColumn = () => {
    const newData = data.map(row => [...row, ''])
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName)
  }

  // Delete last column
  const deleteColumn = () => {
    if (data[0]?.length <= 1) return
    const newData = data.map(row => row.slice(0, -1))
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName)
  }

  // Clear all data
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      const newData = [
        ['Item', 'Quantity', 'Price', 'Total'],
        ['', '', '', '']
      ]
      setData(newData)
      saveToHistory(newData)
      saveData(newData, fileName)
    }
  }

  // Export to Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  // Import Excel file
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 })
      
      // Ensure data is a 2D array
      const formattedData = jsonData.length > 0 ? jsonData : [['', '', '', '']]
      setData(formattedData)
      saveToHistory(formattedData)
      saveData(formattedData, fileName)
      
      // Update file name if not set
      if (fileName === 'admin-data') {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setFileName(nameWithoutExt)
      }
    }
    reader.readAsBinaryString(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Loading Spreadsheet...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{spreadsheetStyles}</style>
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Excel Manager</h1>
                <p className="text-sm text-gray-500">Professional Spreadsheet for Admin</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* File Name */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <input
                  type="text"
                  placeholder="File name..."
                  value={fileName}
                  onChange={handleFileNameChange}
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-48"
                />
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-2 px-4 py-2">
                {saving ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-sm text-blue-600 font-medium">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 mr-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 mr-4" />

            {/* File Operations */}
            <div className="flex items-center gap-2 mr-4">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-600 cursor-pointer transition-all shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 mr-4" />

            {/* Row/Column Operations */}
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={addRow}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-xl font-semibold hover:from-emerald-200 hover:to-teal-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
              <button
                onClick={deleteRow}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-xl font-semibold hover:from-amber-200 hover:to-orange-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Delete Row
              </button>
            </div>

            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={addColumn}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-xl font-semibold hover:from-indigo-200 hover:to-purple-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Column
              </button>
              <button
                onClick={deleteColumn}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-xl font-semibold hover:from-orange-200 hover:to-red-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Delete Column
              </button>
            </div>

            <div className="flex-1" />

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-xl font-semibold hover:from-rose-200 hover:to-pink-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 overflow-x-auto">
            <Spreadsheet
              data={data}
              onChange={handleDataChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-1">Tips & Tricks</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Data is automatically saved to the server as you type</li>
                <li>• Use Undo/Redo buttons to navigate changes</li>
                <li>• Click Export to download your spreadsheet as Excel file</li>
                <li>• Import existing Excel (.xlsx, .xls) or CSV files</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
