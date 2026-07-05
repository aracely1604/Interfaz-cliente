import { useMemo, useState } from 'react'
import { guardarPedido } from '../models/modeloCliente'

export const productos = [
  { id: 1, nombre: 'Papas rústicas', descripcion: 'Crujientes, con salsa de la casa', precio: 4500, icono: '🍟', categoria: 'Para picar' },
  { id: 2, nombre: 'Hot dog clásico', descripcion: 'Vienesa, palta, tomate y mayo', precio: 5200, icono: '🌭', categoria: 'Favoritos' },
  { id: 3, nombre: 'Pollo crispy', descripcion: '3 piezas doradas y especiadas', precio: 6900, icono: '🍗', categoria: 'Favoritos' },
  { id: 4, nombre: 'Burger del barrio', descripcion: 'Carne, cheddar, cebolla y salsa', precio: 7500, icono: '🍔', categoria: 'Favoritos' },
  { id: 5, nombre: 'Aros de cebolla', descripcion: 'Porción de 10 unidades', precio: 3900, icono: '🧅', categoria: 'Para picar' },
  { id: 6, nombre: 'Bebida lata', descripcion: 'Elige tu sabor favorito', precio: 1800, icono: '🥤', categoria: 'Bebidas' },
]

export function usePedido() {
  const [carrito, setCarrito] = useState([]); const [enviando, setEnviando] = useState(false); const [confirmado, setConfirmado] = useState(false)
  const agregar = (producto) => setCarrito((actual) => { const item = actual.find((x) => x.id === producto.id); return item ? actual.map((x) => x.id === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x) : [...actual, { ...producto, cantidad: 1 }] })
  const cambiarCantidad = (id, cambio) => setCarrito((a) => a.map((x) => x.id === id ? { ...x, cantidad: x.cantidad + cambio } : x).filter((x) => x.cantidad > 0))
  const subtotal = useMemo(() => carrito.reduce((s, x) => s + x.precio * x.cantidad, 0), [carrito]); const delivery = 3000; const total = subtotal + delivery
  const finalizar = async (datos, usuario) => { setEnviando(true); try { await guardarPedido({ clienteId: usuario?.uid || null, productos: carrito, subtotal, delivery, total, entrega: datos, metodoPago: datos.metodoPago, montoEfectivo: datos.metodoPago === 'efectivo' ? Number(datos.montoEfectivo) : null }); setConfirmado(true); setCarrito([]); return true } finally { setEnviando(false) } }
  return { carrito, agregar, cambiarCantidad, subtotal, delivery, total, enviando, confirmado, finalizar, vaciarCarrito: () => setCarrito([]) }
}
