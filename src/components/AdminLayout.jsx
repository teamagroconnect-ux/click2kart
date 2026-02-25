import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const Icon = ({ name }) => (
  <span className="inline-block w-4 h-4 mr-2 align-middle">
    {name === 'dash' && (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.75" />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.3" />
      </svg>
    )}
    {name === 'prod' && (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7.5 12 4l8 3.5-8 3.5L4 7.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 11.5 12 15l8-3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 15.5 12 19l8-3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {name === 'cat' && (
      <svg viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="4"
          width="16"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="4"
          y="14"
          width="10"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M17 14v6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    )}
    {name === 'bill' && (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 7h6M9 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )}
    {name === 'order' && (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5 7h14l-1.2 9H6.2L5 7Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="19" r="1.4" fill="currentColor" />
        <circle cx="17" cy="19" r="1.4" fill="currentColor" />
      </svg>
    )}
    {name === 'coupon' && (
      <svg viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="5"
          width="16"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M12 5v14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="2 2"
        />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="9" cy="14" r="1" fill="currentColor" />
      </svg>
    )}
    {name === 'partner' && (
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="9"
          cy="9"
          r="3"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle
          cx="17"
          cy="9"
          r="3"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M4.5 19c.7-2.2 2.8-3.5 4.5-3.5s3.8 1.3 4.5 3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M13.5 18.5c.6-1.9 2.2-3 3.5-3 1.3 0 2.9 1.1 3.5 3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 border border-slate-800"
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
          <div className="inline-flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-semibold">
              C2K
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Click2Kart Admin</div>
              <div className="text-[10px] text-slate-400">Inventory & billing cockpit</div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-red-600 hover:border-red-500"
        >
          <span>Logout</span>
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-3.5rem)] md:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          className={`border-r border-slate-800 bg-slate-950/60 backdrop-blur-md ${
            open ? 'block' : 'hidden'
          } md:block`}
        >
          <div className="h-full flex flex-col">
            <div className="px-4 py-4 border-b border-slate-800">
              <div className="text-xs uppercase text-slate-500 tracking-wide mb-1">
                Navigation
              </div>
              <div className="text-[11px] text-slate-500">
                Manage products, orders and billing.
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 text-slate-100">
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
            </nav>
            <div className="px-4 py-3 border-t border-slate-800 text-[11px] text-slate-500">
              Last synced just now • All data lives on Click2Kart server.
            </div>
          </div>
        </aside>

        <main className="bg-slate-950/90 text-slate-50">
          <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-[0_18px_45px_rgba(15,23,42,0.8)] p-3 md:p-5">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
