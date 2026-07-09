import { useState, useEffect, useCallback } from 'react'
import Spreadsheet from 'react-spreadsheet'
import * as XLSX from 'xlsx'
import api from '../../lib/api'

export default function AdminExcel() {
  const [data, setData] = useState([
    ['Item', 'Quantity', 'Price', 'Total'],
    ['', '', '', '']
  ])
  const [fileName, setFileName] = useState('admin-data')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load data from server on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/api/admin/excel')
        if (res.data.data) setData(res.data.data)
        if (res.data.fileName) setFileName(res.data.fileName)
      } catch (err) {
        console.error('Failed to load Excel data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Save data to server
  const saveData = useCallback(async (newData, newFileName) => {
    setSaving(true)
    try {
      await api.put('/api/admin/excel', {
        data: newData,
        fileName: newFileName
      })
    } catch (err) {
      console.error('Failed to save Excel data:', err)
    } finally {
      setSaving(false)
    }
  }, [])

  const handleDataChange = (newData) => {
    setData(newData)
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
    saveData(newData, fileName)
  }

  // Delete last row
  const deleteRow = () => {
    if (data.length <= 1) return
    const newData = data.slice(0, -1)
    setData(newData)
    saveData(newData, fileName)
  }

  // Add new column
  const addColumn = () => {
    const newData = data.map(row => [...row, ''])
    setData(newData)
    saveData(newData, fileName)
  }

  // Delete last column
  const deleteColumn = () => {
    if (data[0]?.length <= 1) return
    const newData = data.map(row => row.slice(0, -1))
    setData(newData)
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
      setData(jsonData)
      saveData(jsonData, fileName)
    }
    reader.readAsBinaryString(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Excel Manager</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
            Independent Spreadsheet for Stock & Notes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="File name..."
            value={fileName}
            onChange={handleFileNameChange}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
          {saving && (
            <span className="text-sm text-gray-500">Saving...</span>
          )}
        </div>
      </div>

      {/* Row/Column Controls */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 shadow-md flex flex-wrap items-center gap-3">
        <button
          onClick={addRow}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
        <button
          onClick={deleteRow}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
          </svg>
          Delete Row
        </button>
        <div className="w-px h-8 bg-gray-200 mx-2" />
        <button
          onClick={addColumn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Column
        </button>
        <button
          onClick={deleteColumn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Delete Column
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-lg">
        <Spreadsheet
          data={data}
          onChange={handleDataChange}
          className="w-full"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-4 text-amber-800 text-sm font-medium">
        <p className="flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Data is automatically saved to the server. Use Export to save a copy to your computer!
        </p>
      </div>
    </div>
  )
}
