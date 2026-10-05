import { Cabecera, formatoPesos } from './Componentes'
import { productos } from '../controllers/usarPedido'
import '../styles/VistaMenu.css'
import { useState } from 'react'

export default function VistaMenu({ pedido, ir, cerrarSesion, usuario }) {
  const [opcionesElegidas, setOpcionesElegidas] = useState({});
  const cantidad = pedido.carrito.reduce((s, x) => s + x.cantidad, 0);

  return (
    <main className="pagina-tienda">
      <Cabecera ir={ir} cantidad={cantidad} cerrarSesion={cerrarSesion} />
      <section className="hero-menu">
        <div>
          <span className="etiqueta">HOY ES UN BUEN DÍA PARA</span>
          <h1>Darte un gustito.</h1>
          <p>Hola, {usuario?.nombres?.split(' ')[0] || 'qué bueno verte'} 👋 Elige tus favoritos y nosotros hacemos el resto.</p>
        </div>
        <div className="plato">🍔<span>🍟</span></div>
      </section>
      
      <section className="contenido">
        <div className="titulo-seccion">
          <div>
            <span>NUESTRO MENÚ</span>
            <h2>¿Qué se te antoja?</h2>
          </div>
          <p>Todo preparado al momento con ingredientes frescos.</p>
        </div>
        <div className="grilla-productos">
          {productos.map((p) => (
            <article className="producto" key={p.id}>
              <div className="foto-producto">
                <span>{p.icono}</span>
                <small>{p.categoria}</small>
              </div>
              <div className="info-producto">
                <h3>{p.nombre}</h3>
                <p>{p.descripcion}</p>
                {p.opciones && (
                  <label className="selector-opcion">
                    <span>{p.opcionEtiqueta}</span>
                    <select value={opcionesElegidas[p.id] || ''} onChange={(evento) => setOpcionesElegidas((actual) => ({ ...actual, [p.id]: evento.target.value }))}>
                      <option value="">Seleccionar</option>
                      {p.opciones.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                    </select>
                  </label>
                )}
                <div>
                  <b>{formatoPesos(p.precio)}</b>
                  <button aria-label={`Agregar ${p.nombre}`} disabled={p.opciones && !opcionesElegidas[p.id]} onClick={() => pedido.agregar(p.opciones ? { ...p, id: `${p.id}-${opcionesElegidas[p.id]}`, nombre: `${p.nombre} (${opcionesElegidas[p.id]})`, descripcion: `${p.descripcion} Opción: ${opcionesElegidas[p.id]}.` } : p)}>
                    ＋ Agregar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </section>
      
      {cantidad > 0 && (
        <button className="carrito-flotante" onClick={() => ir('carrito')}>
          <span>🛒 Ver carrito</span>
          <b>{cantidad} · {formatoPesos(pedido.subtotal)}</b>
        </button>
      )}
    </main>
  );
}
