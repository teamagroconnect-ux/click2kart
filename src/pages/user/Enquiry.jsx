import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../../lib/api'

export default function Enquiry(){
  const nav = useNavigate()
  const loc = useLocation()
  const initial = loc.state?.productId ? [{ productId: loc.state.productId, quantity: 1 }] : []
  const [items, setItems] = useState(initial)
  const [customer, setCustomer] = useState({ name:'', phone:'', email:'' })
  const submit = async (e)=>{
    e.preventDefault()
    await api.post('/api/orders', { customer, items })
    nav('/')
  }
  return (
    <div className="max-w-xl mx-auto p-6 md:p-10">
      <form onSubmit={submit} className="bg-white border rounded-xl p-8 space-y-4 shadow-sm">
        <div className="text-2xl font-bold mb-4">Place your order</div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="border p-3 w-full rounded-md text-base" placeholder="Enter your name" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input className="border p-3 w-full rounded-md text-base" placeholder="Enter phone number" value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
            <input className="border p-3 w-full rounded-md text-base" placeholder="Enter email address" value={customer.email} onChange={e=>setCustomer({...customer, email:e.target.value})} />
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg w-full text-lg font-bold transition-colors mt-6">
          Place order
        </button>
      </form>
    </div>
  )
}

