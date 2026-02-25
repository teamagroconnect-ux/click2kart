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
    <div className="max-w-xl mx-auto p-6">
      <form onSubmit={submit} className="bg-white border rounded p-6 space-y-3">
        <div className="text-lg font-semibold mb-2">Product Enquiry</div>
        <input className="border p-2 w-full" placeholder="Name" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} />
        <input className="border p-2 w-full" placeholder="Phone" value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} />
        <input className="border p-2 w-full" placeholder="Email" value={customer.email} onChange={e=>setCustomer({...customer, email:e.target.value})} />
        <button className="bg-blue-600 text-white py-2 rounded w-full">Submit Enquiry</button>
      </form>
    </div>
  )
}

