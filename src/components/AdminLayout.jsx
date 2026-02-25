import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Icon = ({name}) => (
  <span className="inline-block w-4 h-4 mr-2 align-middle">
    {name==='dash' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>)}
    {name==='prod' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16V8l-9-5-9 5v8l9 5 9-5zM5 9.27L12 13l7-3.73V8l-7 3-7-3v1.27z"/></svg>)}
    {name==='cat' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v4H3V5zm0 5h18v9H3v-9z"/></svg>)}
    {name==='bill' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15H6V2zm9 1.5V8h4.5L15 3.5z"/></svg>)}
    {name==='order' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.68l1.24-7H6l1.16 7zM6 4h13v2H6V4z"/></svg>)}
    {name==='coupon' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5H3v6h2a2 2 0 1 0 0-4H3V5zm0 8h-2a2 2 0 1 0 0 4h2v2H3v-6h18v0z"/></svg>)}
    {name==='partner' && (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h7v-1.5c0-.7.1-1.37.29-2H2.53C3.3 14.9 5.35 13 8 13zm8 0c-2.64 0-4.69 1.9-5.47 4.5-.19.63-.29 1.3-.29 2V20h11v-1.5C21 14.17 16.33 13 16 13z"/></svg>)}
  </span>
)

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('token'); navigate('/admin/login') }
  const link = (to, label) => (
    <NavLink to={to} onClick={()=>setOpen(false)} className={({isActive}) => `block px-3 py-2 rounded ${isActive? 'bg-blue-600 text-white':'hover:bg-gray-200'}`}>{label}</NavLink>
  )
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr] grid-cols-1">
      <button className="md:hidden p-3 border-b flex items-center justify-between" onClick={()=>setOpen(!open)}>
        <span className="font-semibold">Admin</span>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/></svg>
      </button>
      <aside className={`bg-white border-r p-4 space-y-2 ${open? 'block':'hidden'} md:block`}>
        <div className="font-semibold text-lg mb-4">Admin</div>
        {link('/admin', <><Icon name="dash"/>Dashboard</>)}
        {link('/admin/products', <><Icon name="prod"/>Products</>)}
        {link('/admin/categories', <><Icon name="cat"/>Categories</>)}
        {link('/admin/billing', <><Icon name="bill"/>Billing</>)}
        {link('/admin/orders', <><Icon name="order"/>Orders</>)}
        {link('/admin/coupons', <><Icon name="coupon"/>Coupons</>)}
        {link('/admin/partners', <><Icon name="partner"/>Partners</>)}
        <button onClick={logout} className="mt-4 w-full bg-red-600 text-white py-2 rounded">Logout</button>
      </aside>
      <main className="p-4 md:p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}
