import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useToast } from '../components/Toast'
import { useAuth } from './AuthContext'
import api from './api'

const CartContext = createContext()

export const getStockStatus = (stock) => {
  if (stock <= 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' }
  if (stock <= 5) return { text: `Only ${stock} left`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' }
  if (stock <= 20) return { text: 'Limited Stock', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
  return { text: 'In Stock', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
}

export function CartProvider({ children }) {
  const { notify } = useToast()
  const { token } = useAuth()
  const [cart, setCart] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
    return saved ? JSON.parse(saved) : []
  })
  const [mode, setMode] = useState(token ? 'server' : 'guest')
  const mergedRef = useRef(false)

  useEffect(() => {
    if (mode === 'guest') {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart, mode])

  useEffect(() => {
    if (!token) {
      setMode('guest')
      mergedRef.current = false
      const saved = localStorage.getItem('cart')
      setCart(saved ? JSON.parse(saved) : [])
      return
    }

    setMode('server')

    const syncServerCart = async () => {
      try {
        const saved = !mergedRef.current ? localStorage.getItem('cart') : null
        const localItems = saved ? JSON.parse(saved) : []

        if (localItems.length) {
          for (const item of localItems) {
            await api.post('/api/cart/add', {
              productId: item._id,
              quantity: item.quantity || 1
            })
          }
          localStorage.removeItem('cart')
          mergedRef.current = true
        }

        const { data } = await api.get('/api/cart')
        setCart(data.items || [])
      } catch (e) {
        console.error('Failed to sync server cart', e)
      }
    }

    syncServerCart()
  }, [token])

  const addToCart = async (product, variant) => {
    if (mode === 'guest') {
      let success = true
      setCart(prev => {
        const pid = product._id || product.id
        const vid = variant?._id || variant?.id || undefined
        const existing = prev.find(item => item._id === pid && String(item.variantId||'') === String(vid||''))
        const currentQty = existing ? existing.quantity : 0
        const available = vid ? (variant?.stock ?? 0) : (product.stock ?? 0)
        const minQty = Math.max(1, Number(product.minOrderQty || 0))
        const addQty = existing ? 1 : Math.max(1, minQty)

        if (currentQty + addQty > available) {
          notify(`Only ${available} units available in stock`, 'error')
          success = false
          return prev
        }

        if (existing) {
          return prev.map(item => 
            (item._id === pid && String(item.variantId||'') === String(vid||'')) ? { ...item, quantity: item.quantity + addQty } : item
          )
        }
        const price = vid ? (variant?.price ?? product.price) : product.price
        const image = vid ? (variant?.images?.[0] || product.images?.[0]) : product.images?.[0]
        const attributes = variant?.attributes
        return [...prev, { ...product, _id: pid, variantId: vid, attributes, price, image, quantity: addQty, stock: available, minOrderQty: minQty }]
      })
      return success
    }

    try {
      const minQty = Math.max(1, Number(product.minOrderQty || 0))
      const { data } = await api.post('/api/cart/add', {
        productId: product._id,
        variantId: variant?._id,
        quantity: Math.max(1, minQty)
      })
      setCart(data.items || [])
      notify('Added to cart', 'success')
      return true
    } catch (err) {
      notify(err?.response?.data?.error || 'Could not add to cart', 'error')
      return false
    }
  }

  const removeFromCart = async (productId) => {
    if (mode === 'guest') {
      setCart(prev => prev.filter(item => item._id !== productId))
      return
    }
    try {
      const { data } = await api.delete('/api/cart/remove', {
        data: { productId }
      })
      setCart(data.items || [])
    } catch (err) {
      notify(err?.response?.data?.error || 'Could not remove item', 'error')
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return

    if (mode === 'guest') {
      setCart(prev => {
        const item = prev.find(x => x._id === productId)
        if (!item) return prev
        const minQty = Math.max(1, Number(item.minOrderQty || 0))
        const nextQty = Math.max(minQty, quantity)

        if (nextQty > item.stock) {
          notify(`Only ${item.stock} units available in stock`, 'error')
          return prev
        }

        return prev.map(x => x._id === productId ? { ...x, quantity: nextQty } : x)
      })
      return
    }

    try {
      const { data } = await api.put('/api/cart/update', { productId, quantity })
      setCart(data.items || [])
    } catch (err) {
      notify(err?.response?.data?.error || 'Could not update quantity', 'error')
    }
  }

  const clearCart = async () => {
    if (mode === 'guest') {
      setCart([])
      return
    }
    try {
      // remove all items one by one
      for (const item of cart) {
        await api.delete('/api/cart/remove', { data: { productId: item.productId || item._id } })
      }
      setCart([])
    } catch (err) {
      notify(err?.response?.data?.error || 'Could not clear cart', 'error')
    }
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => {
    let p = Number(item.price || 0)
    const qty = Math.max(1, Number(item.quantity || 1))
    
    // Apply bulk pricing
    if (Array.isArray(item.bulkTiers) && item.bulkTiers.length) {
      const tiers = item.bulkTiers.slice().sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0))
      const app = tiers.filter(t => qty >= Number(t.quantity || 0)).pop()
      if (app) p = Math.max(0, p - Number(app.priceReduction ?? app.price_reduction ?? 0))
    } else if (Number(item.bulkDiscountQuantity || item.bulkQty) > 0) {
      if (qty >= Number(item.bulkDiscountQuantity || item.bulkQty)) {
        p = Math.max(0, p - Number(item.bulkDiscountPriceReduction || item.bulkRed || 0))
      }
    }
    
    return total + (p * qty)
  }, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
