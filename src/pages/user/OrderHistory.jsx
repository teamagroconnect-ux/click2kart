import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const phone = localStorage.getItem('userPhone')

  useEffect(() => {
    if (!phone) {
      navigate('/login')
      return
    }

    api.get('/api/orders/my-orders', { params: { phone } })
      .then(({ data }) => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [phone, navigate])

  if (loading) return <div className="p-10 text-center text-lg text-gray-500">Loading your orders...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-gray-600 mt-2">History of all orders placed with {phone}</p>
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
          {orders.map((order) => (
            <div key={order._id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-50 px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-6 text-sm">
                  <div>
                    <div className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Order Placed</div>
                    <div className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Total</div>
                    <div className="font-semibold">₹{order.totalEstimate}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase font-bold text-[10px] tracking-widest">Status</div>
                    <div className={`font-bold ${
                      order.status === 'FULFILLED' ? 'text-emerald-600' : 
                      order.status === 'CANCELLED' ? 'text-red-600' : 'text-blue-600'
                    }`}>{order.status}</div>
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
              <div className="p-6 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg border overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-gray-400">No image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-gray-900 truncate">{item.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity} • ₹{item.price} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
