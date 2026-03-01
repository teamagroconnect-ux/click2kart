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

  const addToCart = async (product) => {
    if (mode === 'guest') {
      let success = true
      setCart(prev => {
        const pid = product._id || product.id
        const existing = prev.find(item => item._id === pid)
        const currentQty = existing ? existing.quantity : 0

        if (currentQty + 1 > product.stock) {
          notify(`Only ${product.stock} units available in stock`, 'error')
          success = false
          return prev
        }

        if (existing) {
          return prev.map(item => 
            item._id === pid ? { ...item, quantity: item.quantity + 1 } : item
          )
        }
        return [...prev, { ...product, _id: pid, quantity: 1 }]
      })
      return success
    }

    try {
      const { data } = await api.post('/api/cart/add', {
        productId: product._id,
        quantity: 1
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

        if (quantity > item.stock) {
          notify(`Only ${item.stock} units available in stock`, 'error')
          return prev
        }

        return prev.map(x => x._id === productId ? { ...x, quantity } : x)
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
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
