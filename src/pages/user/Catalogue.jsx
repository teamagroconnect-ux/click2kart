import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { getCloudinaryUrl } from '../../lib/cloudinary'
import { useCart } from '../../lib/CartContext'
import { useAuth } from '../../lib/AuthContext'
import { setSEO } from '../../shared/lib/seo.js'

// Helper to get min price of product
const getMinPrice = (p) => {
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };
  if (!Array.isArray(p.variants) || p.variants.length === 0) return safeNumber(p.price || 0);
  const activeVariants = p.variants.filter(v => v.isActive !== false && safeNumber(v.price || 0) > 0);
  if (activeVariants.length === 0) return safeNumber(p.price || 0);
  return Math.min(...activeVariants.map(v => safeNumber(v.price || 0)));
};

// Calculate discount percentage
const getDiscountPercent = (price, mrp) => {
  if (!mrp || Number(mrp) <= Number(price)) return 0;
  return Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100);
};

export default function Catalogue({ initialBrand, brandName }) {
  const { addToCart } = useCart()
  const { token } = useAuth()
  const authed = !!token
  const navigate = useNavigate()
  const location = useLocation()

  const [q, setQ] = useState('')
  const [sug, setSug] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [brand, setBrand] = useState(initialBrand || '')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [sort, setSort] = useState('NEW')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [viewMode, setViewMode] = useState('GRID') // 'GRID' or 'LIST'
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 20

  // Queries
  const {
    data: productData,
    isLoading: loadingProducts,
  } = useQuery({
    queryKey: ['products', { q, brand, category, subCategory, limit, currentPage, authed }],
    queryFn: async () => {
      const { data } = await api.get('/api/products', {
        params: { q, page: currentPage, limit, brand: brand || undefined, category: category || undefined, subCategory: subCategory || undefined },
      })
      return data
    },
    staleTime: 1000 * 60 * 30,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', { brand }],
    queryFn: () => {
      const params = { active: true }
      if (brand) params.brand = brand
      return api.get('/api/categories', { params }).then(res => res.data || [])
    },
    staleTime: 1000 * 60 * 60 * 24,
  })

  const items = useMemo(() => {
    return productData?.items || []
  }, [productData])

  const filteredSorted = useMemo(() => {
    let list = [...items]
    if (authed) {
      const mn = Number(minPrice), mx = Number(maxPrice)
      if (!isNaN(mn) && minPrice !== '') list = list.filter(p => getMinPrice(p) >= mn)
      if (!isNaN(mx) && maxPrice !== '') list = list.filter(p => getMinPrice(p) <= mx)

      if (sort === 'PRICE_LOW') list.sort((a, b) => getMinPrice(a) - getMinPrice(b))
      if (sort === 'PRICE_HIGH') list.sort((a, b) => getMinPrice(b) - getMinPrice(a))
    }
    if (sort === 'NEW') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return list
  }, [items, minPrice, maxPrice, sort, authed])

  // SEO
  useEffect(() => {
    const title = category ? `${category} · Wholesale | Click2Kart`
      : q ? `Search: ${q} | Click2Kart` : 'B2B Collection | Click2Kart'
    setSEO(title, 'Discover quality wholesale electronics with exclusive B2B pricing, GST billing, and bulk discounts.')
  }, [q, category])

  // Sort options
  const sortOpts = [
    { v: 'NEW', l: 'Newest First' },
    ...(authed ? [
      { v: 'PRICE_LOW', l: 'Price: Low → High' },
      { v: 'PRICE_HIGH', l: 'Price: High → Low' },
    ] : [])
  ]

  // Skeleton Loader
  if (loadingProducts && items.length === 0) {
    return (
      <div className="ct">
        <div className="ct-topbar">
          <div className="ct-topbar-inner">
            <Link to="/" className="ct-brand">
              <img src="/layoutlogo.png" alt="Click2Kart" className="ct-brand-logo" />
            </Link>
            <div className="ct-cart-icon">
              <div className="ct-cart-badge">0</div>
            </div>
          </div>
        </div>
        <div className="ct-layout">
          <div className="ct-skel-search"></div>
          <div className="ct-skel-cats"></div>
          <div className="ct-skel-filters"></div>
          <div className="ct-skel-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="ct-skel-card">
                <div className="ct-skel-img"></div>
                <div className="ct-skel-body">
                  <div className="ct-skel-line" style={{width: '40%'}}></div>
                  <div className="ct-skel-line" style={{width: '90%'}}></div>
                  <div className="ct-skel-line" style={{width: '70%'}}></div>
                  <div className="ct-skel-line" style={{width: '50%', marginTop: 'auto', height: 20}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ct">
      {/* Subtle Grid Pattern Background */}
      <div className="ct-grid-bg"></div>

      {/* Header - Sticky, 72px Height */}
      <header className="ct-header">
        <div className="ct-header-inner">
          <Link to="/" className="ct-header-brand">
            <img src="/layoutlogo.png" alt="Click2Kart" className="ct-header-logo" />
          </Link>
          
          {/* Floating Cart */}
          <Link to="/cart" className="ct-header-cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="ct-header-cart-count">3</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="ct-main">
        <div className="ct-container">
          {/* Large Search Bar */}
          <div className="ct-search-section">
            <div className="ct-searchbar">
              <svg className="ct-searchbar-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search products, brands..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="ct-searchbar-input"
              />
              {q && (
                <button 
                  className="ct-searchbar-clear" 
                  onClick={() => setQ('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
              <button className="ct-searchbar-filter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
            </div>
          </div>

          {/* Category Chips - Horizontal Scroll */}
          <div className="ct-cats-section">
            <div className="ct-cats-scroll">
              <button
                key="all"
                className={`ct-cat-chip ${!category ? 'ct-cat-chip-active' : ''}`}
                onClick={() => setCategory('')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`ct-cat-chip ${category === cat.name ? 'ct-cat-chip-active' : ''}`}
                  onClick={() => setCategory(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="ct-filters-bar">
            <button className="ct-filter-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filter
            </button>
            <div className="ct-sort-buttons">
              {sortOpts.map(opt => (
                <button
                  key={opt.v}
                  className={`ct-sort-btn ${sort === opt.v ? 'ct-sort-btn-active' : ''}`}
                  onClick={() => setSort(opt.v)}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            <div className="ct-view-toggle">
              <button
                className={`ct-view-btn ${viewMode === 'GRID' ? 'ct-view-btn-active' : ''}`}
                onClick={() => setViewMode('GRID')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                className={`ct-view-btn ${viewMode === 'LIST' ? 'ct-view-btn-active' : ''}`}
                onClick={() => setViewMode('LIST')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Product Catalogue */}
          {viewMode === 'GRID' ? (
            <div className="ct-grid">
              {filteredSorted.map((p, idx) => {
                const price = getMinPrice(p)
                const discount = getDiscountPercent(price, p.mrp)
                return (
                  <Link
                    key={p._id}
                    to={`/product/${p._id}`}
                    className="ct-card"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Top Section - Badges & Actions */}
                    <div className="ct-card-top">
                      {discount > 0 && (
                        <div className="ct-disc-badge">
                          -{discount}% OFF
                        </div>
                      )}
                      <div className="ct-card-actions">
                        <button className="ct-action-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                        </button>
                        <button className="ct-action-btn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="ct-card-img-wrap">
                      {p.images && p.images[0] ? (
                        <img
                          src={getCloudinaryUrl(p.images[0])}
                          alt={p.name}
                          className="ct-card-img"
                        />
                      ) : (
                        <div className="ct-card-img-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="ct-card-body">
                      <div className="ct-verified-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Verified
                      </div>
                      <h3 className="ct-card-name">{p.name}</h3>
                      <div className="ct-card-price-wrap">
                        <div className="ct-card-price">
                          {authed ? (
                            <>₹{price.toLocaleString()}</>
                          ) : (
                            <>₹••••</>
                          )}
                        </div>
                        {discount > 0 && (
                          <div className="ct-card-discount">{discount}% OFF</div>
                        )}
                        {p.mrp && Number(p.mrp) > Number(price) && (
                          <div className="ct-card-mrp">₹{Number(p.mrp).toLocaleString()}</div>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button - Floating Purple */}
                    <button 
                      className="ct-add-to-cart"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (authed && p.variants && p.variants.length > 0) {
                          addToCart(p, p.variants[0], 1)
                        }
                      }}
                      disabled={!authed}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </Link>
                )
              })}
            </div>
          ) : (
            // List View
            <div className="ct-list">
              {filteredSorted.map((p, idx) => {
                const price = getMinPrice(p)
                const discount = getDiscountPercent(price, p.mrp)
                return (
                  <Link
                    key={p._id}
                    to={`/product/${p._id}`}
                    className="ct-list-card"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="ct-list-img-wrap">
                      {p.images && p.images[0] ? (
                        <img
                          src={getCloudinaryUrl(p.images[0])}
                          alt={p.name}
                          className="ct-list-img"
                        />
                      ) : (
                        <div className="ct-list-img-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="ct-list-content">
                      <div className="ct-verified-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Verified
                      </div>
                      <h3 className="ct-list-name">{p.name}</h3>
                      <div className="ct-list-price-wrap">
                        <div className="ct-list-price">
                          {authed ? (
                            <>₹{price.toLocaleString()}</>
                          ) : (
                            <>₹••••</>
                          )}
                        </div>
                        {discount > 0 && (
                          <div className="ct-list-discount">{discount}% OFF</div>
                        )}
                        {p.mrp && Number(p.mrp) > Number(price) && (
                          <div className="ct-list-mrp">₹{Number(p.mrp).toLocaleString()}</div>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      className="ct-list-add-to-cart"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (authed && p.variants && p.variants.length > 0) {
                          addToCart(p, p.variants[0], 1)
                        }
                      }}
                      disabled={!authed}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Empty State (if needed) */}
          {filteredSorted.length === 0 && !loadingProducts && (
            <div className="ct-empty-state">
              <div className="ct-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h3 className="ct-empty-title">No products found</h3>
              <p className="ct-empty-desc">Try adjusting your search or filters</p>
              <button 
                className="ct-empty-btn"
                onClick={() => {
                  setQ('')
                  setCategory('')
                  setSort('NEW')
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Nav */}
      <nav className="ct-bottom-nav">
        <Link to="/" className="ct-nav-item ct-nav-item-active">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </Link>
        <Link to="/catalogue" className="ct-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Browse</span>
        </Link>
        <Link to="/orders" className="ct-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Orders</span>
        </Link>
        <Link to="/profile" className="ct-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Profile</span>
        </Link>
      </nav>

      {/* Styles */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #FAF8FF;
          color: #111827;
          line-height: 1.5;
        }

        .ct {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          padding-bottom: 90px; /* Space for bottom nav */
        }

        /* Subtle Grid Background */
        .ct-grid-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Header */
        .ct-header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 72px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.08);
          box-shadow: 0 2px 24px rgba(109, 61, 245, 0.06);
        }

        .ct-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ct-header-brand {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .ct-header-logo {
          height: 42px;
          width: auto;
          object-fit: contain;
        }

        .ct-header-cart {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          color: white;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(109, 61, 245, 0.25);
        }

        .ct-header-cart:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 20px rgba(109, 61, 245, 0.35);
        }

        .ct-header-cart-count {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FF8A00;
          color: white;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FAF8FF;
        }

        /* Main Container */
        .ct-main {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .ct-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        /* Search Section */
        .ct-search-section {
          margin-bottom: 24px;
        }

        .ct-searchbar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 1.5px solid rgba(139, 92, 246, 0.12);
          border-radius: 18px;
          padding: 0 16px 0 18px;
          height: 56px;
          box-shadow: 0 4px 20px rgba(109, 61, 245, 0.06);
          transition: all 0.3s ease;
        }

        .ct-searchbar:focus-within {
          border-color: rgba(139, 92, 246, 0.35);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1), 0 8px 28px rgba(109, 61, 245, 0.1);
        }

        .ct-searchbar-ico {
          color: #8B5CF6;
          flex-shrink: 0;
        }

        .ct-searchbar-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 15px;
          font-weight: 500;
          color: #111827;
          font-family: 'DM Sans', sans-serif;
        }

        .ct-searchbar-input::placeholder {
          color: #9CA3AF;
        }

        .ct-searchbar-clear {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(139, 92, 246, 0.08);
          border: none;
          color: #6D3DF5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ct-searchbar-clear:hover {
          background: rgba(139, 92, 246, 0.15);
          transform: scale(1.1);
        }

        .ct-searchbar-filter {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.1);
          border: none;
          color: #6D3DF5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ct-searchbar-filter:hover {
          background: rgba(139, 92, 246, 0.2);
          transform: scale(1.05);
        }

        /* Category Chips */
        .ct-cats-section {
          margin-bottom: 20px;
        }

        .ct-cats-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
        }

        .ct-cats-scroll::-webkit-scrollbar {
          display: none;
        }

        .ct-cat-chip {
          flex-shrink: 0;
          padding: 10px 22px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.2px;
          background: white;
          color: #6B7280;
          border: 1.5px solid rgba(139, 92, 246, 0.15);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.03);
        }

        .ct-cat-chip:hover {
          border-color: rgba(139, 92, 246, 0.3);
          color: #6D3DF5;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08);
        }

        .ct-cat-chip-active {
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          border-color: transparent;
          color: white;
          box-shadow: 0 6px 18px rgba(109, 61, 245, 0.35);
          transform: translateY(-1px);
        }

        .ct-cat-chip-active:hover {
          background: linear-gradient(135deg, #5B2AD4, #7C4DFF);
          transform: translateY(-1px) scale(1.02);
        }

        /* Filter Bar */
        .ct-filters-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .ct-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 14px;
          background: white;
          border: 1.5px solid rgba(139, 92, 246, 0.18);
          color: #6D3DF5;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.05);
        }

        .ct-filter-btn:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
        }

        .ct-sort-buttons {
          display: flex;
          gap: 8px;
          flex: 1;
        }

        .ct-sort-btn {
          padding: 10px 16px;
          border-radius: 14px;
          background: white;
          border: 1.5px solid rgba(139, 92, 246, 0.12);
          color: #6B7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ct-sort-btn:hover {
          border-color: rgba(139, 92, 246, 0.25);
          color: #6D3DF5;
        }

        .ct-sort-btn-active {
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 14px rgba(109, 61, 245, 0.3);
        }

        .ct-view-toggle {
          display: flex;
          gap: 4px;
          background: white;
          padding: 4px;
          border-radius: 14px;
          border: 1.5px solid rgba(139, 92, 246, 0.12);
        }

        .ct-view-btn {
          width: 40px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #6B7280;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ct-view-btn:hover {
          color: #6D3DF5;
        }

        .ct-view-btn-active {
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          color: white;
          box-shadow: 0 2px 8px rgba(109, 61, 245, 0.3);
        }

        /* Product Grid */
        .ct-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        @media (min-width: 640px) {
          .ct-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (min-width: 1024px) {
          .ct-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1280px) {
          .ct-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Product Card */
        .ct-card {
          background: white;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          animation: ctFadeUp 0.5s ease both;
        }

        .ct-card:hover {
          transform: scale(1.02) translateY(-4px);
          box-shadow: 0 12px 32px rgba(109, 61, 245, 0.12);
          border-color: rgba(139, 92, 246, 0.18);
        }

        .ct-card-top {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 10;
        }

        .ct-disc-badge {
          padding: 6px 10px;
          border-radius: 10px;
          background: linear-gradient(135deg, #16C45B, #0EA55A);
          color: white;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(22, 196, 91, 0.35);
        }

        .ct-card-actions {
          display: flex;
          gap: 8px;
        }

        .ct-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          color: #6B7280;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        .ct-action-btn:hover {
          background: white;
          color: #6D3DF5;
          transform: scale(1.1);
        }

        .ct-card-img-wrap {
          background: white;
          padding: 18px;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ct-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .ct-card:hover .ct-card-img {
          transform: scale(1.05);
        }

        .ct-card-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E5E7EB;
        }

        .ct-card-body {
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ct-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 100px;
          background: rgba(139, 92, 246, 0.08);
          color: #6D3DF5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          width: fit-content;
        }

        .ct-card-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ct-card-price-wrap {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ct-card-price {
          font-size: 20px;
          font-weight: 700;
          color: #6D3DF5;
        }

        .ct-card-discount {
          font-size: 12px;
          font-weight: 700;
          color: #16C45B;
        }

        .ct-card-mrp {
          font-size: 13px;
          color: #9CA3AF;
          text-decoration: line-through;
          font-weight: 500;
        }

        .ct-add-to-cart {
          position: absolute;
          bottom: 14px;
          right: 14px;
          width: 46px;
          height: 46px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(109, 61, 245, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ct-add-to-cart:hover:not(:disabled) {
          transform: scale(1.12);
          box-shadow: 0 10px 28px rgba(109, 61, 245, 0.5);
        }

        .ct-add-to-cart:active:not(:disabled) {
          transform: scale(0.95);
        }

        .ct-add-to-cart:disabled {
          background: #F3F4F6;
          color: #D1D5DB;
          box-shadow: none;
          cursor: not-allowed;
        }

        /* List View */
        .ct-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ct-list-card {
          background: white;
          border-radius: 22px;
          padding: 16px;
          display: flex;
          gap: 16px;
          border: 1px solid rgba(139, 92, 246, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          text-decoration: none;
          transition: all 0.3s ease;
          animation: ctFadeUp 0.5s ease both;
          align-items: center;
        }

        .ct-list-card:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(109, 61, 245, 0.1);
          border-color: rgba(139, 92, 246, 0.18);
        }

        .ct-list-img-wrap {
          width: 100px;
          height: 100px;
          border-radius: 18px;
          background: white;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }

        .ct-list-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ct-list-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E5E7EB;
        }

        .ct-list-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .ct-list-name {
          font-size: 17px;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
        }

        .ct-list-price-wrap {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ct-list-price {
          font-size: 22px;
          font-weight: 700;
          color: #6D3DF5;
        }

        .ct-list-discount {
          font-size: 13px;
          font-weight: 700;
          color: #16C45B;
        }

        .ct-list-mrp {
          font-size: 14px;
          color: #9CA3AF;
          text-decoration: line-through;
          font-weight: 500;
        }

        .ct-list-add-to-cart {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(109, 61, 245, 0.4);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .ct-list-add-to-cart:hover:not(:disabled) {
          transform: scale(1.12);
          box-shadow: 0 10px 28px rgba(109, 61, 245, 0.5);
        }

        .ct-list-add-to-cart:disabled {
          background: #F3F4F6;
          color: #D1D5DB;
          box-shadow: none;
          cursor: not-allowed;
        }

        /* Empty State */
        .ct-empty-state {
          text-align: center;
          padding: 80px 24px;
        }

        .ct-empty-icon {
          width: 96px;
          height: 96px;
          border-radius: 28px;
          background: rgba(139, 92, 246, 0.06);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #8B5CF6;
          margin-bottom: 20px;
        }

        .ct-empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .ct-empty-desc {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 24px;
        }

        .ct-empty-btn {
          padding: 12px 28px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(109, 61, 245, 0.35);
          transition: all 0.3s ease;
        }

        .ct-empty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(109, 61, 245, 0.45);
        }

        /* Floating Bottom Nav */
        .ct-bottom-nav {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          border: 1px solid rgba(139, 92, 246, 0.12);
          box-shadow: 0 10px 40px rgba(109, 61, 245, 0.15);
          z-index: 200;
        }

        .ct-nav-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 18px;
          border-radius: 20px;
          text-decoration: none;
          color: #6B7280;
          transition: all 0.25s ease;
        }

        .ct-nav-item:hover {
          color: #6D3DF5;
          background: rgba(139, 92, 246, 0.06);
        }

        .ct-nav-item-active {
          background: linear-gradient(135deg, #6D3DF5, #8B5CF6);
          color: white;
          box-shadow: 0 4px 14px rgba(109, 61, 245, 0.4);
        }

        .ct-nav-item span {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* Skeleton Styles */
        .ct-skel-search {
          height: 56px;
          border-radius: 18px;
          background: white;
          margin-bottom: 24px;
          animation: ctShimmer 1.5s ease infinite;
        }

        .ct-skel-cats {
          height: 40px;
          border-radius: 100px;
          background: white;
          margin-bottom: 20px;
          animation: ctShimmer 1.5s ease infinite;
        }

        .ct-skel-filters {
          height: 44px;
          border-radius: 14px;
          background: white;
          margin-bottom: 24px;
          animation: ctShimmer 1.5s ease infinite;
        }

        .ct-skel-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        @media (min-width: 1024px) {
          .ct-skel-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .ct-skel-card {
          background: white;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(139, 92, 246, 0.08);
        }

        .ct-skel-img {
          aspect-ratio: 1;
          background: linear-gradient(90deg, #F7F5FF, #EDE9FF, #F7F5FF);
          background-size: 200% 100%;
          animation: ctShimmer 1.5s ease infinite;
        }

        .ct-skel-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ct-skel-line {
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #F7F5FF, #EDE9FF, #F7F5FF);
          background-size: 200% 100%;
          animation: ctShimmer 1.5s ease infinite;
        }

        /* Keyframes */
        @keyframes ctFadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ctShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
