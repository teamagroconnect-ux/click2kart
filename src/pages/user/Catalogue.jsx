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
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">All Products</h1>
          <p className="text-xs text-gray-600">Browse by category, search and filter like a shopping site.</p>
        </div>
        <div className="flex gap-2 items-center">
          <input className="border p-2 rounded text-sm w-56" placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)} />
          <select className="border p-2 rounded text-sm" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="NEW">Newest</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-4">
        <aside className="bg-white border rounded-lg p-4 space-y-4 h-max">
          <div>
            <div className="text-sm font-semibold mb-2">Categories</div>
            <div className="space-y-1 max-h-60 overflow-y-auto text-sm">
              <button onClick={()=>setCategory('')} className={`block w-full text-left px-2 py-1 rounded ${category===''? 'bg-blue-50 text-blue-700 font-semibold':'hover:bg-gray-100'}`}>All</button>
              {categories.map(c => (
                <button key={c._id} onClick={()=>setCategory(c.name)} className={`block w-full text-left px-2 py-1 rounded capitalize ${category===c.name? 'bg-blue-50 text-blue-700 font-semibold':'hover:bg-gray-100'}`}>{c.name}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Price</div>
            <div className="flex gap-2 text-xs">
              <input className="border p-1 rounded w-1/2" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
              <input className="border p-1 rounded w-1/2" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
            </div>
          </div>
        </aside>
        <main className="space-y-4">
          {loading && <div className="text-sm text-gray-500">Loading products...</div>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSorted.map(p => (
              <Link key={p._id} to={`/products/${p._id}`} className="bg-white border rounded-lg overflow-hidden hover:shadow transition-shadow flex flex-col">
                <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center">
                  {p.images && p.images.length>0
                    ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain" />
                    : <span className="text-xs text-gray-400">No image</span>}
                </div>
                <div className="p-3 space-y-1 flex-1 flex flex-col">
                  <div className="text-xs uppercase text-gray-500 tracking-wide">{p.category || 'Uncategorized'}</div>
                  <div className="font-medium text-sm line-clamp-2">{p.name}</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">₹{p.price}</div>
                  <div className="mt-auto pt-2 text-xs text-blue-600">View details</div>
                </div>
              </Link>
            ))}
            {!loading && filteredSorted.length===0 && (
              <div className="col-span-full text-sm text-gray-500">No products found. Try changing filters.</div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div>Page {page} of {Math.max(1, Math.ceil(total/limit))}</div>
            <div className="space-x-2">
              <button onClick={()=>load(Math.max(1, page-1))} className="px-3 py-1 border rounded disabled:opacity-50" disabled={page===1}>Prev</button>
              <button onClick={()=>load(page+1)} className="px-3 py-1 border rounded disabled:opacity-50" disabled={page*limit>=total}>Next</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
