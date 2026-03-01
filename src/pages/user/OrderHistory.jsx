import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const fmtIST = (d) => new Date(d).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  })

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/api/orders/my')
      .then(({ data }) => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [token, navigate])

  if (loading) return <div className="p-10 text-center text-lg text-gray-500">Loading your orders...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-gray-600 mt-2">History of all your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center space-y-4 shadow-sm">
          <div className="text-gray-400 text-lg">No orders found yet.</div>
          <button 
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedId === order._id
            return (
            <div key={order._id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isExpanded ? 'ring-1 ring-violet-200 shadow-md' : 'hover:shadow-md'}`}>
              <div 
                className="bg-gray-50 px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : order._id)}
              >
                <div className="flex gap-6 text-sm">
                  <div>
                    <div className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Order Placed</div>
                    <div className="font-semibold">{fmtIST(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Total</div>
                    <div className="font-semibold">₹{order.totalEstimate}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Status</div>
                    {(() => {
                      const displayStatus = order.status === 'PENDING_CASH_APPROVAL' ? 'NEW' : order.status
                      const cls =
                        displayStatus === 'FULFILLED' ? 'text-emerald-600' :
                        displayStatus === 'CANCELLED' ? 'text-red-600' :
                        'text-blue-600'
                      return <div className={`font-bold ${cls}`}>{displayStatus}</div>
                    })()}
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Payment</div>
                    <div className="font-bold text-gray-700">
                      {order.paymentMethod === 'CASH' ? '💼 Offline' : '💳 Online'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">ID: {order._id}</div>
              </div>
              <div className={`p-6 space-y-4 ${isExpanded ? '' : 'hidden md:block'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Customer</div>
                    <div className="text-sm font-bold text-gray-900">{order.customer?.name}</div>
                    <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                    {order.customer?.email && <div className="text-xs text-gray-500">{order.customer.email}</div>}
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Identifiers</div>
                    <div className="text-xs text-gray-500">Order ID: {order._id}</div>
                    {order.billId && <div className="text-xs text-gray-500">Bill ID: {order.billId}</div>}
                    <div className="text-xs text-gray-500">Created: {fmtIST(order.createdAt)}</div>
                    <div className="text-xs text-gray-500">Updated: {fmtIST(order.updatedAt)}</div>
                  </div>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-gray-900 truncate">{item.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity} • ₹{item.price} each</div>
                    </div>
                  </div>
                ))}
                {order.status === 'FULFILLED' && !order.feedbackRating && (
                  <div className="pt-4 border-t">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rate Delivery</div>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          onClick={async () => {
                            try {
                              const { data } = await api.post(`/api/orders/${order._id}/feedback`, { rating: star })
                              setOrders(prev => prev.map(o => o._id === order._id ? { ...o, feedbackRating: data.feedbackRating } : o))
                            } catch {}
                          }}
                          className={`h-8 w-8 rounded-lg border ${star <= 3 ? 'border-gray-200' : 'border-emerald-200'} bg-white hover:bg-gray-50`}
                          title={`${star} Star`}
                        >
                          <svg className={`w-4 h-4 ${star <= 3 ? 'text-gray-300' : 'text-emerald-500'}`} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 .587l3.668 7.431L24 9.748l-6 5.848L19.335 24 12 19.771 4.665 24 6 15.596 0 9.748l8.332-1.73z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {order.paymentStatus === 'PAID' && order.billId && (
                  <div className="pt-4 border-t">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Invoice</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const token = localStorage.getItem('token')
                          window.open(`${api.defaults.baseURL}/api/bills/${order.billId}/pdf?token=${token}`, '_blank')
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest"
                      >
                        View PDF
                      </button>
                      <button
                        onClick={() => {
                          const token = localStorage.getItem('token')
                          window.open(`${api.defaults.baseURL}/api/bills/${order.billId}/html?token=${token}`, '_blank')
                        }}
                        className="px-3 py-2 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest"
                      >
                        View HTML
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
