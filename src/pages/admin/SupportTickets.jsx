import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { getImageUrl } from '../../lib/cloudinary'
import { io } from 'socket.io-client'
import { CONFIG } from '../../shared/lib/config'

export default function SupportTickets() {
  const { notify } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [reply, setReply] = useState('')
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [userContext, setUserContext] = useState(null)
  const [loadingContext, setLoadingContext] = useState(false)

  const adminIcon = "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" // Female executive icon

  useEffect(() => {
    loadTickets()

    const socket = io(CONFIG.API_BASE_URL)
    socket.emit("join_admin")

    socket.on("new_ticket", (newTicket) => {
      setTickets(prev => [newTicket, ...prev])
      notify("New support ticket received!", "info")
    })

    socket.on("ticket_message", ({ ticketId, message }) => {
      loadTickets() // Refresh list to show latest message/timestamp
    })

    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    let socket;
    if (selectedTicket) {
      loadUserContext(selectedTicket._id)
      
      socket = io(CONFIG.API_BASE_URL)
      socket.on(`ticket_update_${selectedTicket._id}`, (updatedTicket) => {
        setSelectedTicket(updatedTicket)
      })
    } else {
      setUserContext(null)
    }

    return () => {
      if (socket) socket.disconnect()
    }
  }, [selectedTicket?._id])

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

  const loadUserContext = async (ticketId) => {
    setLoadingContext(true)
    try {
      const { data } = await api.get(`/api/support-tickets/admin/ticket/${ticketId}/context`)
      setUserContext(data)
    } catch (err) {
      console.error('Failed to load user context', err)
    } finally {
      setLoadingContext(false)
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

  const handleEditMessage = async (messageId) => {
    if (!editValue.trim()) return
    try {
      const { data } = await api.put(`/api/support-tickets/${selectedTicket._id}/messages/${messageId}`, { message: editValue })
      setSelectedTicket(data)
      setEditingMessageId(null)
      setEditValue('')
      notify('Message updated', 'success')
    } catch (err) {
      notify('Failed to update message', 'error')
    }
  }

  const handleRequestImage = async () => {
    try {
      const { data } = await api.post(`/api/support-tickets/${selectedTicket._id}/request-image`, { 
        message: "Assistant: Please upload an image for verification." 
      })
      setSelectedTicket(data)
      notify('Image request sent', 'success')
    } catch (err) {
      notify('Failed to request image', 'error')
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

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      notify('Uploading image...', 'info')
      const { data: uploadData } = await api.post('/api/upload/image', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      })
      const { data: ticketData } = await api.post(`/api/support-tickets/${selectedTicket._id}/upload-image`, { 
        imageUrl: uploadData.url 
      })
      setSelectedTicket(ticketData)
      notify('Image uploaded and sent', 'success')
    } catch (err) {
      notify('Failed to upload image', 'error')
    } finally {
      e.target.value = ''
    }
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-widest text-xs">Initializing Support Hub...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Support Command Center</h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time customer assistance portal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">System Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Ticket List */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="bg-white border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-5 border-b bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inbox</h3>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">{tickets.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {tickets.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-xs font-bold uppercase tracking-widest">No tickets yet</p>
                </div>
              ) : (
                tickets.map(t => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-5 text-left transition-all border-b border-gray-50 hover:bg-gray-50 group relative ${selectedTicket?._id === t._id ? 'bg-indigo-50/50' : ''}`}
                  >
                    {selectedTicket?._id === t._id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                        t.status === 'Open' ? 'bg-amber-100 text-amber-700' : 
                        t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                        t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-black text-sm text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">#{t.ticketId || 'TK-NEW'}</div>
                    <div className="font-bold text-xs text-gray-700 truncate">{t.subject}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                      {t.user?.name || 'Unknown'}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          {selectedTicket ? (
            <div className="bg-white border rounded-3xl overflow-hidden shadow-xl flex flex-col h-full bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
              {/* Chat Header */}
              <div className="p-4 bg-white/95 backdrop-blur-md border-b flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl shadow-inner border border-indigo-100">
                    {selectedTicket.category === 'Order' ? '📦' : selectedTicket.category === 'Payment' ? '💰' : '💬'}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-2">
                      #{selectedTicket.ticketId}
                      <span className="text-[10px] text-gray-400 font-bold border px-1.5 py-0.5 rounded-md uppercase tracking-widest">{selectedTicket.category}</span>
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Session</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedTicket.status} 
                    onChange={(e) => updateStatus(selectedTicket._id, e.target.value)}
                    className="bg-gray-100 border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="flex justify-center mb-6">
                  <div className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                    Conversation Started · {new Date(selectedTicket.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Initial Description */}
                <div className="flex justify-start mb-6">
                  <div className="bg-white rounded-2xl rounded-tl-none p-5 shadow-sm border border-gray-100 max-w-[85%]">
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-600"></span>
                      Initial Issue Description
                    </div>
                    <div className="text-sm font-bold text-gray-800 leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>
                </div>

                {selectedTicket.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                    {m.sender !== 'admin' && (
                      <div className="h-8 w-8 rounded-lg bg-white border shadow-sm flex items-center justify-center text-xs font-black text-gray-400 mb-1">
                        {selectedTicket.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-md relative group ${
                      m.sender === 'admin' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                    }`}>
                      {editingMessageId === m._id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg p-2 text-sm text-white focus:outline-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingMessageId(null)} className="text-[10px] font-bold uppercase hover:underline">Cancel</button>
                            <button onClick={() => handleEditMessage(m._id)} className="text-[10px] font-black uppercase bg-white text-indigo-600 px-2 py-1 rounded-md">Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {m.sender === 'admin' && (
                            <button 
                              onClick={() => { setEditingMessageId(m._id); setEditValue(m.message); }}
                              className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-indigo-600"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                          )}
                          <div className="text-sm font-bold leading-relaxed whitespace-pre-wrap">
                            {m.type === 'image_request' && (
                              <span className="mr-2 text-indigo-200">
                                📷 {m.isFulfilled ? 'Request Fulfilled:' : 'Request:'}
                              </span>
                            )}
                            {m.message}
                          </div>
                          {m.type === 'image' && m.attachments?.length > 0 && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-white/20 shadow-inner bg-black/5">
                              <img src={getImageUrl(m.attachments[0])} alt="Attached" className="max-w-full h-auto max-h-[300px] object-contain mx-auto" />
                            </div>
                          )}
                        </>
                      )}
                      <div className={`text-[9px] mt-2 font-black uppercase tracking-widest flex items-center justify-between gap-4 ${
                        m.sender === 'admin' ? 'text-indigo-200' : 'text-gray-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span>{m.sender === 'admin' ? 'Executive Support' : 'Customer'}</span>
                          {m.isEdited && <span className="italic opacity-70">(Edited)</span>}
                        </div>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {m.sender === 'admin' && (
                      <img src={adminIcon} alt="Support" className="h-8 w-8 rounded-full border-2 border-white shadow-sm mb-1 bg-white" />
                    )}
                  </div>
                ))}
                
                {selectedTicket.status === 'Open' && (
                  <div className="flex justify-center italic text-[11px] text-gray-500 font-medium bg-white/50 backdrop-blur-sm py-2 rounded-xl border border-gray-100">
                    "Our executive will assist you soon..."
                  </div>
                )}
              </div>

              {/* Chat Input */}
              {selectedTicket.status !== 'Closed' && (
                <div className="p-4 bg-white/95 backdrop-blur-md border-t">
                  <div className="flex gap-2 items-center bg-gray-100 p-2 rounded-2xl border border-gray-200 focus-within:border-indigo-300 transition-all">
                    <button
                      onClick={handleRequestImage}
                      title="Request Image from User"
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </button>
                    <label className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    </label>
                    <input
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleReply()}
                      placeholder="Write a professional response..."
                      className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={!reply.trim()}
                      className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-white border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-gray-50/50">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center mb-6 text-5xl">🎧</div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight mb-2">Select a Conversation</h3>
              <p className="text-sm max-w-xs font-medium text-gray-500">Pick a ticket from the inbox to start providing assistance and resolve customer queries.</p>
            </div>
          )}
        </div>

        {/* User Context Sidebar */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          {selectedTicket ? (
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="p-5 border-b bg-gray-50/50">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer Intelligence</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {/* User Profile */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {userContext?.user?.kyc?.profilePicture ? (
                      <img 
                        src={getImageUrl(userContext.user.kyc.profilePicture)} 
                        alt={userContext.user?.name} 
                        className="h-14 w-14 rounded-2xl object-cover shadow-lg border-2 border-white"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {userContext?.user?.name?.charAt(0) || selectedTicket.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-black text-gray-900 tracking-tight">{userContext?.user?.name || selectedTicket.user?.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{userContext?.user?.phone || selectedTicket.user?.phone}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
                      <span className="text-xs font-bold text-gray-700 truncate ml-4">{userContext?.user?.email || selectedTicket.user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    Recent Orders
                  </h4>
                  {loadingContext ? (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : userContext?.recentOrders?.length > 0 ? (
                    <div className="space-y-2">
                      {userContext.recentOrders.map(o => (
                        <div key={o._id} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black text-indigo-600">#{o._id.slice(-6).toUpperCase()}</span>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              o.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                            }`}>{o.status}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                            <span className="text-xs font-black text-gray-900">₹{o.totalEstimate?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed rounded-2xl text-gray-400 text-[10px] font-bold uppercase tracking-widest">No order history</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white border rounded-3xl flex flex-col items-center justify-center p-12 text-center text-gray-300 border-dashed">
              <div className="text-3xl mb-2">👤</div>
              <p className="text-[10px] font-black uppercase tracking-widest">User context hidden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}