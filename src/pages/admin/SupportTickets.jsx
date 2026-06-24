import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'

export default function SupportTickets() {
  const { notify } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [reply, setReply] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/support-tickets/admin/all')
      setTickets(data)
    } catch (err) {
      notify('Failed to load tickets', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!reply.trim()) return
    try {
      const { data } = await api.post(`/api/support-tickets/${selectedTicket._id}/messages`, { message: reply })
      setSelectedTicket(data)
      setReply('')
      loadTickets()
      notify('Reply sent', 'success')
    } catch (err) {
      notify('Failed to send reply', 'error')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/support-tickets/admin/${id}/status`, { status })
      loadTickets()
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket(prev => ({ ...prev, status }))
      }
      notify('Status updated', 'success')
    } catch (err) {
      notify('Failed to update status', 'error')
    }
  }

  if (loading && tickets.length === 0) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Loading support system...</div>
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">Manage and respond to customer queries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-gray-50/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Recent Tickets</h3>
            </div>
            <div className="divide-y max-h-[70vh] overflow-y-auto custom-scrollbar">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase">No tickets found</div>
              ) : (
                tickets.map(t => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-4 text-left transition-all hover:bg-gray-50 ${selectedTicket?._id === t._id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        t.status === 'Open' ? 'bg-amber-100 text-amber-700' : 
                        t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-gray-900 truncate">{t.subject}</div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{t.user?.name || 'Unknown User'}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[75vh]">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-indigo-600">{selectedTicket.category}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">{selectedTicket.user?.email}</span>
                  </div>
                </div>
                <select 
                  value={selectedTicket.status} 
                  onChange={(e) => updateStatus(selectedTicket._id, e.target.value)}
                  className="bg-gray-50 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/30">
                {selectedTicket.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      m.sender === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 border'
                    }`}>
                      <div className="text-sm font-medium leading-relaxed">{m.message}</div>
                      <div className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${
                        m.sender === 'admin' ? 'text-indigo-200' : 'text-gray-400'
                      }`}>
                        {m.sender} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'Closed' && (
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleReply()}
                      placeholder="Type your response..."
                      className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!reply.trim()}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-white border border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">💬</div>
              <h3 className="font-bold text-gray-900 mb-1">Select a ticket</h3>
              <p className="text-sm max-w-xs">Select a ticket from the list to view the conversation and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}