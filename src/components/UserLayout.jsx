import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-1.5 rounded hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <span className="sr-only">Toggle menu</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <Link to="/" className="inline-flex items-center gap-1">
                <span className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                  C2K
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight text-gray-900">
                    Click2Kart
                  </div>
                  <div className="text-[10px] text-gray-500 hidden xs:block">
                    Electronics & mobiles
                  </div>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 items-center gap-4">
              <nav className="flex items-center gap-2 text-sm">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    classNames(
                      'px-2 py-1 rounded-md hover:bg-gray-100',
                      isActive && 'text-blue-600 font-medium'
                    )
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    classNames(
                      'px-2 py-1 rounded-md hover:bg-gray-100',
                      isActive && 'text-blue-600 font-medium'
                    )
                  }
                >
                  Products
                </NavLink>
                <NavLink
                  to="/partner"
                  className={({ isActive }) =>
                    classNames(
                      'px-2 py-1 rounded-md hover:bg-gray-100',
                      isActive && 'text-blue-600 font-medium'
                    )
                  }
                >
                  Partner
                </NavLink>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative inline-flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 6h14l-1.2 6H9.2L7 6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 6 5.5 3.5H3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="18" r="1.3" fill="currentColor" />
                  <circle cx="17" cy="18" r="1.3" fill="currentColor" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-3 space-y-2 text-sm">
              <nav className="flex flex-col border-t pt-2 mt-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    classNames(
                      'px-2 py-1.5 rounded-md',
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
                    )
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    classNames(
                      'px-2 py-1.5 rounded-md',
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
                    )
                  }
                >
                  Products
                </NavLink>
                <NavLink
                  to="/partner"
                  className={({ isActive }) =>
                    classNames(
                      'px-2 py-1.5 rounded-md',
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
                    )
                  }
                >
                  Partner
                </NavLink>
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    className="flex-1 inline-flex justify-center items-center px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 inline-flex justify-center items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <Outlet />
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-[11px] text-gray-500">
            © {new Date().getFullYear()} Click2Kart. All rights reserved.
          </div>
          <div className="text-[11px] text-gray-400 flex gap-3">
            <span>Secure billing</span>
            <span>Local service support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

