import { createContext, useContext, useState } from 'react'

const ToastCtx = createContext({ notify: () => {} })
export const useToast = () => useContext(ToastCtx)

export default function ToastProvider({ children }) {
  const [messages, setMessages] = useState([])
  const notify = (text, kind='info') => {
    const id = Math.random().toString(36).slice(2)
    setMessages((m)=>{
      const last = m[m.length - 1]
      if (last && last.text === text && last.kind === kind) return m
      return [...m, { id, text, kind }]
    })
    setTimeout(()=> setMessages((m)=> m.filter(x=>x.id!==id)), 3000)
  }
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-md space-y-2 flex flex-col items-stretch px-4">
          {messages.slice(-3).map(m => (
            <div
              key={m.id}
              className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold tracking-tight border animate-in slide-in-from-bottom-2 fade-in duration-200 ${
                m.kind==='error'
                  ? 'bg-red-600 border-red-500'
                  : m.kind==='success'
                  ? 'bg-emerald-600 border-emerald-500'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">
                  {m.kind==='error' ? '⚠️' : m.kind==='success' ? '✅' : 'ℹ️'}
                </span>
                <span className="flex-1">{m.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastCtx.Provider>
  )
}
