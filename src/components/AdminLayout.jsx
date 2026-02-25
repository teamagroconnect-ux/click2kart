import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Icon = ({ name }) => (
  <span className="inline-block w-4 h-4 mr-2 align-middle">
    {name === 'dash' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )}
    {name === 'prod' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    )}
    {name === 'cat' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </svg>
    )}
    {name === 'bill' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    )}
    {name === 'order' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )}
    {name === 'coupon' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 0 0 6v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 0 0-6Z" />
        <path d="M12 11h.01" />
        <path d="M12 15h.01" />
        <path d="M12 7h.01" />
      </svg>
    )}
    {name === 'partner' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )}
    {name === 'cust' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )}
  </span>
)

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/admin/login')
  }
  const link = (to, label) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        [
          'flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group',
          isActive
            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-[1.02]'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:pl-5'
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-6 md:px-10 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-xl shadow-blue-100 border border-blue-500">
              C2K
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-gray-900">Click2Kart</span>
                <span className="px-2 py-0.5 bg-gray-900 text-[10px] font-black text-white rounded-lg tracking-widest uppercase">Admin</span>
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Operational Cockpit</div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="group inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-xs font-black text-gray-600 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all active:scale-95"
        >
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="uppercase tracking-widest">Logout</span>
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-5rem)] md:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className={`border-r border-gray-100 bg-white/50 backdrop-blur-sm ${
            open ? 'fixed inset-0 z-40 bg-white pt-20' : 'hidden'
          } md:block sticky top-20 h-[calc(100vh-5rem)]`}
        >
          <div className="h-full flex flex-col p-6">
            <div className="mb-8 px-2">
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">
                Navigation
              </div>
              <div className="text-xs text-gray-500 font-medium leading-relaxed">
                Manage your store inventory, customers and finances.
              </div>
            </div>
            <nav className="flex-1 space-y-2">
              {link('/admin', (
                <>
                  <Icon name="dash" />
                  Dashboard
                </>
              ))}
              {link('/admin/products', (
                <>
                  <Icon name="prod" />
                  Products
                </>
              ))}
              {link('/admin/categories', (
                <>
                  <Icon name="cat" />
                  Categories
                </>
              ))}
              {link('/admin/billing', (
                <>
                  <Icon name="bill" />
                  Billing
                </>
              ))}
              {link('/admin/orders', (
                <>
                  <Icon name="order" />
                  Orders
                </>
              ))}
              {link('/admin/coupons', (
                <>
                  <Icon name="coupon" />
                  Coupons
                </>
              ))}
              {link('/admin/partners', (
                <>
                  <Icon name="partner" />
                  Partners
                </>
              ))}
              {link('/admin/customers', (
                <>
                  <Icon name="cust" />
                  Customers
                </>
              ))}
              <div className="pt-6 mt-6 border-t border-gray-50">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4 px-2">
                  System
                </div>
                {link('/admin/settings', (
                  <>
                    <span className="inline-block w-4 h-4 mr-2 align-middle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                    Settings
                  </>
                ))}
              </div>
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-50 px-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Online
              </div>
            </div>
          </div>
        </aside>

        <main className="bg-gray-50/30">
          <div className="max-w-[1400px] mx-auto p-6 md:p-10">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
