import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../lib/api'

export default function Catalogue(){
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('NEW')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const limit = 12
  const load = async(p=1)=>{
    setLoading(true)
    try {
      const {data} = await api.get('/api/products', { params: { q, page:p, limit, category: category||undefined } })
      setItems(data.items); setTotal(data.total); setPage(p)
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load(1) }, [q, category])
  useEffect(()=>{ api.get('/api/public/categories').then(({data})=>setCategories(data)) }, [])
  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    const cat = params.get('category')
    if (cat) setCategory(cat)
  }, [location.search])

  const filteredSorted = useMemo(()=>{
    let list = [...items]
    const min = Number(minPrice)
    const max = Number(maxPrice)
    if (!Number.isNaN(min) && minPrice!=='') list = list.filter(p => p.price >= min)
    if (!Number.isNaN(max) && maxPrice!=='') list = list.filter(p => p.price <= max)
    if (sort === 'PRICE_LOW') list.sort((a,b)=>a.price-b.price)
    if (sort === 'PRICE_HIGH') list.sort((a,b)=>b.price-a.price)
    if (sort === 'NEW') list.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0))
    return list
  }, [items, minPrice, maxPrice, sort])

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Products</h1>
          <p className="text-sm text-gray-600">Browse by category, search and filter like a shopping site.</p>
        </div>
        <div className="flex gap-3 items-center">
          <input className="border p-2.5 rounded-md text-base w-64" placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="border p-2.5 rounded-md text-base" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="NEW">Newest</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <aside className="bg-white border rounded-lg p-5 space-y-5 h-max">
          <div>
            <div className="text-base font-semibold mb-3">Categories</div>
            <div className="space-y-1 max-h-60 overflow-y-auto text-base">
              <button onClick={()=>setCategory('')} className={`block w-full text-left px-3 py-1.5 rounded-md ${category===''? 'bg-blue-50 text-blue-700 font-semibold':'hover:bg-gray-100'}`}>All</button>
              {categories.map(c => (
                <button key={c._id} onClick={()=>setCategory(c.name)} className={`block w-full text-left px-3 py-1.5 rounded-md capitalize ${category===c.name? 'bg-blue-50 text-blue-700 font-semibold':'hover:bg-gray-100'}`}>{c.name}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-base font-semibold mb-3">Price Range</div>
            <div className="flex gap-3 text-sm">
              <input className="border p-2 rounded-md w-1/2" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
              <input className="border p-2 rounded-md w-1/2" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
            </div>
          </div>
        </aside>
        <main className="space-y-6">
          {loading && <div className="text-base text-gray-500">Loading products...</div>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSorted.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="bg-white border rounded-lg overflow-hidden hover:shadow transition-shadow flex flex-col">
                <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center">
                  {p.images && p.images.length>0
                    ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain" />
                    : <span className="text-sm text-gray-400">No image</span>}
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">{p.category || 'Uncategorized'}</div>
                  <div className="font-semibold text-base line-clamp-2">{p.name}</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">₹{p.price}</div>
                  <div className="mt-auto pt-3 text-sm font-medium text-blue-600">View details</div>
                </div>
              </Link>
            ))}
            {!loading && filteredSorted.length===0 && (
              <div className="col-span-full py-20 text-center text-gray-500 text-lg">No products found</div>
            )}
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t">
            <div>Page {page} of {Math.max(1, Math.ceil(total/limit))}</div>
            <div className="flex gap-2">
              <button onClick={()=>load(Math.max(1, page-1))} className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50" disabled={page===1}>Previous</button>
              <button onClick={()=>load(page+1)} className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50" disabled={page*limit>=total}>Next</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
