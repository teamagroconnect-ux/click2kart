import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { getCloudinaryUrl } from '../../lib/cloudinary'
import { SEO } from '../../shared/lib/seo.jsx'

export default function Brands() {
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/api/brands', { params: { active: true } }).then(res => res.data || []),
    staleTime: 1000 * 60 * 60 * 24,
  })

  return (
    <>
      <SEO
        title="Top Brands"
        description="Browse all top electronics brands available at Click2Kart - India's premier B2B wholesale marketplace."
        url="/brands"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&display=swap');

        .brands-page {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: linear-gradient(180deg, #fdfcff 0%, #faf8ff 100%);
          color: #1e1b2e;
          min-height: 100vh;
          padding: 120px 24px 80px;
          position: relative;
          overflow-x: hidden;
        }

        .brands-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(139,92,246,0.08) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
          z-index: 0;
        }

        .brands-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .brands-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .brands-kicker {
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

        .brands-kicker::before, .brands-kicker::after {
          content: '';
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5));
        }

        .brands-kicker::after {
          background: linear-gradient(90deg, rgba(124,58,237,0.5), transparent);
        }

        .brands-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 8vw, 80px);
          color: #1e1b2e;
          letter-spacing: 0.03em;
          line-height: 1.05;
          margin-bottom: 16px;
        }

        .brands-subtitle {
          color: #6b7280;
          font-size: 16px;
          font-weight: 400;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .brands-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        @media(min-width: 540px) {
          .brands-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media(min-width: 768px) {
          .brands-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        @media(min-width: 1024px) {
          .brands-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .brand-card {
          position: relative;
          background: #ffffff;
          border: 1px solid rgba(139,92,246,0.1);
          border-radius: 28px;
          padding: 32px 24px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          overflow: hidden;
        }

        .brand-card::before {
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

        .brand-card:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.15);
          border-color: transparent;
        }

        .brand-card:hover::before {
          opacity: 1;
        }

        .brand-logo {
          width: 100%;
          height: 80px;
          object-fit: contain;
          margin-bottom: 16px;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .brand-card:hover .brand-logo {
          transform: scale(1.15);
        }

        .brand-name {
          font-size: 14px;
          font-weight: 800;
          color: #1e1b2e;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          text-align: center;
        }

        .brand-fallback {
          font-size: 48px;
          opacity: 0.35;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="brands-page">
        <div className="brands-wrapper">
          <div className="brands-header">
            <div className="brands-kicker">Our Brands</div>
            <h1 className="brands-title">Top Brands</h1>
            <p className="brands-subtitle">
              Explore our curated selection of world-renowned electronics brands, all available at wholesale prices for your business.
            </p>
          </div>

          <div className="brands-grid">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/brand/${brand.slug}`}
                className="brand-card"
                aria-label={`View ${brand.name} products`}
              >
                {brand.logo ? (
                  <img
                    src={getCloudinaryUrl(brand.logo, 160)}
                    alt={brand.name}
                    className="brand-logo"
                    loading="lazy"
                  />
                ) : (
                  <span className="brand-fallback">✦</span>
                )}
                <span className="brand-name">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}