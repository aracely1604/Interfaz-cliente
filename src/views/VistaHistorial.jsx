import { useState } from 'react'
import { Cabecera, formatoPesos } from './Componentes'
import { productos } from '../controllers/usarPedido'
import '../styles/VistaHistorial.css'

export default function VistaHistorial({ pedido, ir, cerrarSesion }) {
  const [cantidadVisible, setCantidadVisible] = useState(3)
  const carrito = Array.isArray(pedido.carrito) ? pedido.carrito : []
  const historial = Array.isArray(pedido.historial) ? pedido.historial : []
  const cantidad = carrito.reduce((suma, item) => suma + item.cantidad, 0)
  const recomendaciones = productos
    .filter((producto) => historial.some((orden) => Array.isArray(orden.productos) && orden.productos.some((item) => String(item.id) === String(producto.id) || String(item.id).startsWith(`${producto.id}-`))))
    .slice(0, 3)
  const formatearFecha = (fecha) => {
    const valor = typeof fecha?.toDate === 'function' ? fecha.toDate() : new Date(fecha)
    return Number.isNaN(valor.getTime()) ? 'Compra anterior' : valor.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }
  const repetir = (orden) => {
    pedido.repetirPedido(orden)
    ir('entrega')
  }
  const obtenerImagen = (item) => {
    if (item.imagen) return item.imagen
    const id = String(item.id ?? '')
    return productos.find((producto) => id === String(producto.id) || id.startsWith(`${producto.id}-`))?.imagen
  }

  return (
    <main className="pagina-historial">
      <Cabecera ir={ir} cantidad={cantidad} cerrarSesion={cerrarSesion} />
      <section className="cabecera-historial">
        <span>COMPRAS ANTERIORES</span>
        <h1>Tu historial de pedidos</h1>
        <p>Encuentra tus favoritos y repítelos en segundos.</p>
      </section>
      <section className="contenido-historial">
        {recomendaciones.length > 0 && (
          <section className="bloque-historial recomendaciones">
            <div className="encabezado-historial">
              <div><span>HECHO PARA TI</span><h2>Vuelve por tus favoritos</h2></div>
              <p>Basado en lo que ya disfrutaste.</p>
            </div>
            <div className="chips-recomendaciones">
              {recomendaciones.map((producto) => (
                <button key={producto.id} onClick={() => pedido.agregar(producto)}>
                  <span className="imagen-recomendacion">{producto.imagen ? <img src={producto.imagen} alt={producto.nombre} loading="lazy" /> : producto.icono}</span><b>{producto.nombre}</b><small>{formatoPesos(producto.precio)}</small><i>＋</i>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="bloque-historial historial-compras">
          <div className="encabezado-historial">
            <div><span>TUS COMPRAS</span><h2>Historial de pedidos</h2></div>
            <p>Repite un pedido y solo confirma tu entrega y pago.</p>
          </div>
          {pedido.cargandoHistorial ? (
            <div className="estado-historial">Cargando tus compras…</div>
          ) : historial.length ? (
            <>
              <div className="lista-historial">
                {historial.slice(0, cantidadVisible).map((orden) => (
                  <article className="pedido-anterior" key={orden.id}>
                    <div className="fecha-pedido"><span>{formatearFecha(orden.creadoEn)}</span><small>Pedido #{orden.id?.slice(0, 6).toUpperCase()}</small></div>
                    <div className="productos-anteriores"><div className="iconos-productos">{Array.isArray(orden.productos) && orden.productos.slice(0, 3).map((item, indice) => {
                      const imagen = obtenerImagen(item)
                      return <span key={`${item.id}-${indice}`} title={item.nombre}>{imagen ? <img src={imagen} alt={item.nombre} loading="lazy" /> : item.icono || '🍽️'}</span>
                    })}</div><p>{Array.isArray(orden.productos) ? orden.productos.map((item) => `${item.cantidad}× ${item.nombre}`).join(' · ') : 'Productos no disponibles'}</p></div>
                    <strong>{formatoPesos(orden.totales?.total ?? orden.total ?? 0)}</strong>
                    <button className="boton-repetir" onClick={() => repetir(orden)}>↻ Repetir pedido</button>
                  </article>
                ))}
              </div>
              {historial.length > cantidadVisible && (
                <button className="boton-mostrar-historial" onClick={() => setCantidadVisible((actual) => actual + 2)}>
                  Mostrar más
                </button>
              )}
            </>
          ) : (
            <div className="estado-historial"><span>🧾</span><div><b>Aún no tienes pedidos anteriores</b><p>Cuando hagas tu primera compra, aparecerá aquí para repetirla fácilmente.</p></div></div>
          )}
        </section>
      </section>
    </main>
  )
}
