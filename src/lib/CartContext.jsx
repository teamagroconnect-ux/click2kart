import { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '../components/Toast'

const CartContext = createContext()

export const getStockStatus = (stock) => {
  if (stock <= 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' }
  if (stock <= 5) return { text: `Only ${stock} left`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' }
  if (stock <= 20) return { text: 'Limited Stock', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
  return { text: 'In Stock', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
}

export function CartProvider({ children }) {
  const { notify } = useToast()
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    let success = true
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id)
      const currentQty = existing ? existing.quantity : 0
      
      if (currentQty + 1 > product.stock) {
        notify(`Only ${product.stock} units available in stock`, 'error')
        success = false
        return prev
      }

      if (existing) {
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    return success
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return
    setCart(prev => {
      const item = prev.find(x => x._id === productId)
      if (!item) return prev
      
      if (quantity > item.stock) {
        notify(`Only ${item.stock} units available in stock`, 'error')
        return prev
      }

      return prev.map(x => x._id === productId ? { ...x, quantity } : x)
    })
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
