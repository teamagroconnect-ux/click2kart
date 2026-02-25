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
    {name === 'cust' && (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
          <div className="inline-flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
              C2K
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-gray-900">Click2Kart Admin</div>
              <div className="text-[10px] text-gray-500">Inventory & billing cockpit</div>
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
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M4.5 13.5V11l1.7-.5a1 1 0 0 0 .6-.5l.9-1.7-1-1.7 1.8-1.8 1.7 1 1.7-.9a1 1 0 0 0 .5-.6L13.5 3h3l.5 1.7a1 1 0 0 0 .5.6l1.7.9 1.7-1 1.8 1.8-1 1.7.9 1.7a1 1 0 0 0 .6.5L21 11v2.5l-1.7.5a1 1 0 0 0-.6.5l-.9 1.7 1 1.7-1.8 1.8-1.7-1-1.7.9a1 1 0 0 0-.5.6L13.5 21h-3l-.5-1.7a1 1 0 0 0-.5-.6l-1.7-.9-1.7 1-1.8-1.8 1-1.7-.9-1.7a1 1 0 0 0-.6-.5l-1.7-.5Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
