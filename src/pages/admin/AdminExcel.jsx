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

// Normalize raw database/import arrays into cell objects expected by react-spreadsheet
const normalizeData = (raw) => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      [{ value: 'Item' }, { value: 'Quantity' }, { value: 'Price' }, { value: 'Total' }],
      [{ value: '' }, { value: '' }, { value: '' }, { value: '' }]
    ];
  }
  return raw.map(row => {
    if (!Array.isArray(row)) return [];
    return row.map(cell => {
      if (cell && typeof cell === 'object' && 'value' in cell) {
        return { value: cell.value !== null && cell.value !== undefined ? String(cell.value) : '' };
      }
      return { value: cell !== null && cell !== undefined ? String(cell) : '' };
    });
  });
};

export default function AdminExcel() {
  const [sheets, setSheets] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [data, setData] = useState([
    [{ value: 'Item' }, { value: 'Quantity' }, { value: 'Price' }, { value: 'Total' }],
    [{ value: '' }, { value: '' }, { value: '' }, { value: '' }]
  ])
  const [fileName, setFileName] = useState('admin-data')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const debounceRef = useRef(null)
  const fileInputRef = useRef(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Load sheet list
  const loadSheetList = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/excel/list')
      setSheets(res.data || [])
      return res.data || []
    } catch (err) {
      console.error('Failed to load Excel list:', err)
      return []
    }
  }, [])

  // Load data from server on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const list = await loadSheetList()
        let initialSheet = null
        if (list.length > 0) {
          const res = await api.get(`/api/admin/excel/${list[0]._id}`)
          initialSheet = res.data
        } else {
          // Create default sheet if list is empty
          const res = await api.post('/api/admin/excel', { fileName: 'admin-data' })
          initialSheet = res.data
          await loadSheetList()
        }
        
        if (initialSheet) {
          setCurrentId(initialSheet._id)
          const normalized = normalizeData(initialSheet.data)
          setData(normalized)
          setFileName(initialSheet.fileName)
          setHistory([normalized])
          setHistoryIndex(0)
        }
      } catch (err) {
        console.error('Init failed:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [loadSheetList])

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
      saveData(prevData, fileName, currentId)
    }
  }, [historyIndex, history, fileName, currentId])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      const nextData = history[newIndex]
      setData(nextData)
      saveData(nextData, fileName, currentId)
    }
  }, [historyIndex, history, fileName, currentId])

  // Save data to server with debounce
  const saveData = useCallback(async (newData, newFileName, id) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Set new debounce
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        const url = id ? `/api/admin/excel/${id}` : '/api/admin/excel'
        await api.put(url, {
          data: newData,
          fileName: newFileName
        })
        setLastSaved(new Date())
        // Refresh sheet list in background
        loadSheetList()
      } catch (err) {
        console.error('Failed to save Excel data:', err)
      } finally {
        setSaving(false)
      }
    }, 800)
  }, [loadSheetList])

  const handleDataChange = (newData) => {
    const normalizedData = normalizeData(newData)
    setData(normalizedData)
    saveToHistory(normalizedData)
    saveData(normalizedData, fileName, currentId)
  }

  const handleFileNameChange = (e) => {
    const newName = e.target.value
    setFileName(newName)
    saveData(data, newName, currentId)
  }

  // Create new sheet
  const handleCreateNew = async () => {
    const name = prompt('Enter new spreadsheet name:') || 'New Spreadsheet'
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await api.post('/api/admin/excel', { fileName: name.trim() })
      const newSheet = res.data
      await loadSheetList()
      // Load the new sheet
      setCurrentId(newSheet._id)
      const normalized = normalizeData(newSheet.data)
      setData(normalized)
      setFileName(newSheet.fileName)
      setHistory([normalized])
      setHistoryIndex(0)
    } catch (err) {
      console.error('Failed to create sheet:', err)
    } finally {
      setSaving(false)
    }
  }

  // Load specific sheet
  const handleLoadSheet = async (id) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/admin/excel/${id}`)
      const sheet = res.data
      setCurrentId(sheet._id)
      const normalized = normalizeData(sheet.data)
      setData(normalized)
      setFileName(sheet.fileName)
      setHistory([normalized])
      setHistoryIndex(0)
    } catch (err) {
      console.error('Failed to load sheet:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete sheet
  const handleDeleteSheet = async (e, id, name) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete spreadsheet "${name}"?`)) return
    
    try {
      await api.delete(`/api/admin/excel/${id}`)
      
      const list = await loadSheetList()
      // If we deleted the currently open sheet, load the next available or create default
      if (id === currentId) {
        if (list.length > 0) {
          handleLoadSheet(list[0]._id)
        } else {
          // If no sheets remain, create a default one
          const res = await api.post('/api/admin/excel', { fileName: 'admin-data' })
          const defaultSheet = res.data
          await loadSheetList()
          setCurrentId(defaultSheet._id)
          const normalized = normalizeData(defaultSheet.data)
          setData(normalized)
          setFileName(defaultSheet.fileName)
          setHistory([normalized])
          setHistoryIndex(0)
        }
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to delete sheet')
    }
  }

  // Add new row
  const addRow = () => {
    const newRow = new Array(data[0]?.length || 4).fill(null).map(() => ({ value: '' }))
    const newData = [...data, newRow]
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName, currentId)
  }

  // Delete last row
  const deleteRow = () => {
    if (data.length <= 1) return
    const newData = data.slice(0, -1)
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName, currentId)
  }

  // Add new column
  const addColumn = () => {
    const newData = data.map(row => [...row, { value: '' }])
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName, currentId)
  }

  // Delete last column
  const deleteColumn = () => {
    if (data[0]?.length <= 1) return
    const newData = data.map(row => row.slice(0, -1))
    setData(newData)
    saveToHistory(newData)
    saveData(newData, fileName, currentId)
  }

  // Clear all data
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      const newData = [
        [{ value: 'Item' }, { value: 'Quantity' }, { value: 'Price' }, { value: 'Total' }],
        [{ value: '' }, { value: '' }, { value: '' }, { value: '' }]
      ]
      setData(newData)
      saveToHistory(newData)
      saveData(newData, fileName, currentId)
    }
  }

  // Export to Excel
  const handleExport = () => {
    const rawRows = data.map(row => row.map(cell => cell?.value || ''))
    const worksheet = XLSX.utils.aoa_to_sheet(rawRows)
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
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      
      const normalizedData = normalizeData(jsonData)
      
      setData(normalizedData)
      saveToHistory(normalizedData)
      
      // Update file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setFileName(nameWithoutExt)
      saveData(normalizedData, nameWithoutExt, currentId)
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
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col overflow-hidden">
      <style>{spreadsheetStyles}</style>
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-30 shrink-0">
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
      <div className="bg-white border-b border-gray-200 z-20 shrink-0">
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
              <button
                onClick={async () => {
                  if (debounceRef.current) clearTimeout(debounceRef.current)
                  setSaving(true)
                  try {
                    const url = currentId ? `/api/admin/excel/${currentId}` : '/api/admin/excel'
                    await api.put(url, {
                      data: data,
                      fileName: fileName
                    })
                    setLastSaved(new Date())
                    loadSheetList()
                  } catch (err) {
                    console.error('Failed to save Excel data:', err)
                    alert('Failed to save! Please try again.')
                  } finally {
                    setSaving(false)
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Now
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

      {/* Main Workspace Layout (Sidebar + Editor) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Spreadsheets List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <span className="font-black text-gray-500 uppercase tracking-widest text-[10px]">Saved Files ({sheets.length})</span>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm"
            >
              + Create
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {sheets.map(sheet => (
              <div
                key={sheet._id}
                onClick={() => handleLoadSheet(sheet._id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 group ${
                  sheet._id === currentId 
                    ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-800 truncate">{sheet.fileName}</div>
                  <div className="text-[9px] text-gray-400 mt-1 font-medium">
                    Updated: {new Date(sheet.updatedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSheet(e, sheet._id, sheet.fileName)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  title="Delete Spreadsheet"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {sheets.length === 0 && (
              <div className="text-[10px] text-gray-400 italic text-center py-6">No saved sheets</div>
            )}
          </div>
        </div>

        {/* Right Editor: react-spreadsheet */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="flex-1 p-6 overflow-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-w-[800px]">
              <div className="p-6">
                <Spreadsheet
                  data={data}
                  onChange={handleDataChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Bottom Info Card */}
          <div className="p-6 border-t border-gray-200 bg-white shrink-0">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">Spreadsheet Tips</h3>
                  <ul className="text-xs text-blue-700 space-y-0.5">
                    <li>• Changes auto-save back to the server.</li>
                    <li>• Use the Left Sidebar to switch between spreadsheets, or create new ones.</li>
                    <li>• Deleting spreadsheets only requires confirmation (no password needed).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
