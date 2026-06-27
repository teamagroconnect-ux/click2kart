import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { getCloudinaryUrl } from '../../lib/cloudinary'
import { SEO } from '../../shared/lib/seo.jsx'

export default function Categories() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/public/categories').then(res => res.data || []),
    staleTime: 1000 * 60 * 60 * 24,
  })

  return (
    <>
      <SEO
        title="All Categories"
        description="Explore all product categories at Click2Kart - India's premier B2B electronics wholesale marketplace."
        url="/categories"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&display=swap');

        .categories-page {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: linear-gradient(180deg, #fdfcff 0%, #faf8ff 100%);
          color: #1e1b2e;
          min-height: 100vh;
          padding: 120px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }

        .categories-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(139,92,246,0.08) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
          z-index: 0;
        }

        .categories-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .categories-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .categories-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 16px;
        }

        .categories-kicker::before, .categories-kicker::after {
          content: '';
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5));
        }

        .categories-kicker::after {
          background: linear-gradient(90deg, rgba(124,58,237,0.5), transparent);
        }

        .categories-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 8vw, 80px);
          color: #1e1b2e;
          letter-spacing: 0.03em;
          line-height: 1.05;
          margin-bottom: 16px;
        }

        .categories-subtitle {
          color: #6b7280;
          font-size: 16px;
          font-weight: 400;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 20px;
        }

        @media(min-width: 540px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(min-width: 900px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }

        .category-card {
          position: relative;
          background: #ffffff;
          border: 1px solid rgba(139,92,246,0.1);
          border-radius: 28px;
          padding: 40px 32px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 2px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s;
        }

        .category-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.15);
          border-color: transparent;
        }

        .category-card:hover::before {
          opacity: 1;
        }

        .category-icon {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1));
          border: 1px solid rgba(124,58,237,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin-bottom: 20px;
          transition: transform 0.4s;
        }

        .category-card:hover .category-icon {
          transform: scale(1.1) rotate(4deg);
        }

        .category-name {
          font-size: 20px;
          font-weight: 800;
          color: #1e1b2e;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .category-desc {
          font-size: 14px;
          color: #6b7280;
          font-weight: 400;
        }
      `}</style>

      <div className="categories-page">
        <div className="categories-wrapper">
          <div className="categories-header">
            <div className="categories-kicker">All Categories</div>
            <h1 className="categories-title">Product Categories</h1>
            <p className="categories-subtitle">
              Browse our complete range of electronics categories to find exactly what your business needs.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-card"
                aria-label={`View ${category.name} products`}
              >
                <div className="category-icon">
                  {category.image ? (
                    <img
                      src={getCloudinaryUrl(category.image, 120)}
                      alt={category.name}
                      style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                      loading="lazy"
                    />
                  ) : (
                    '📦'
                  )}
                </div>
                <span className="category-name">{category.name}</span>
                {category.description && (
                  <span className="category-desc">{category.description}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}