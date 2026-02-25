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
          'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 border border-gray-200"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg border border-blue-500">
              C2K
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-gray-900">Click2Kart</span>
                <span className="px-1.5 py-0.5 bg-gray-900 text-[10px] font-bold text-white rounded-md tracking-wider">ADMIN</span>
              </div>
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Control Panel</div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
        >
          <span>Logout</span>
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-3.5rem)] md:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          className={`border-r border-gray-200 bg-white ${
            open ? 'block' : 'hidden'
          } md:block`}
        >
          <div className="h-full flex flex-col">
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="text-xs uppercase text-gray-500 tracking-wide mb-1">
                Navigation
              </div>
              <div className="text-[11px] text-gray-500">
                Manage products, orders and billing.
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 text-gray-800">
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
                  My Customers
                </>
              ))}
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
            </nav>
            <div className="px-4 py-3 border-t border-gray-200 text-[11px] text-gray-500">
              Last synced just now • All data lives on Click2Kart server.
            </div>
          </div>
        </aside>

        <main className="bg-gray-50 text-gray-900">
          <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-3 md:p-5">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
