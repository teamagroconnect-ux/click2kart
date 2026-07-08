import { useState, useEffect } from 'react'
import Spreadsheet from 'react-spreadsheet'
import * as XLSX from 'xlsx'

export default function AdminExcel() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('admin-excel-data')
    return saved ? JSON.parse(saved) : [
      ['Item', 'Quantity', 'Price', 'Total'],
      ['', '', '', '']
    ]
  })

  const [fileName, setFileName] = useState('admin-data')

  useEffect(() => {
    localStorage.setItem('admin-excel-data', JSON.stringify(data))
  }, [data])

  const handleExport = () => {
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

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
    }
    reader.readAsBinaryString(file)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setData([
        ['Item', 'Quantity', 'Price', 'Total'],
        ['', '', '', '']
      ])
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Excel Manager</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Independent Spreadsheet for Stock & Notes</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="File name..."
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Excel
          </button>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-lg">
        <Spreadsheet
          data={data}
          onChange={setData}
          className="w-full"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-4 text-amber-800 text-sm font-medium">
        <p className="flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Data is automatically saved to your browser's local storage. Use Export to save a copy to your computer!
        </p>
      </div>
    </div>
  )
}
