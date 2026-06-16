/** Pack-size / MOQ helpers — MOQ defaults to packSize, else 1 */

export function getPackSize(product) {
  return Math.max(1, Math.round(Number(product?.packSize || 1)))
}

export function getEffectiveMoq(product) {
  return getPackSize(product)
}

/** Round qty to nearest pack multiple, floored at MOQ */
export function normalizeQty(qty, product) {
  const pack = getPackSize(product)
  const moq = getEffectiveMoq(product)
  let n = Math.round(Number(qty) || 0)
  if (n <= 0) return 0
  if (pack > 1) {
    n = Math.round(n / pack) * pack
    if (n < pack) n = pack
  }
  return Math.max(moq, n)
}

/** Initial quantity when product loads */
export function getInitialQty(product) {
  return getEffectiveMoq(product)
}

export function getVariantKey(variant) {
  if (!variant) return undefined
  if (variant.sku) return String(variant.sku)
  if (variant._id) return String(variant._id)
  return undefined
}
