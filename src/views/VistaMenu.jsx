import { Cabecera, formatoPesos } from './Componentes'
import { productos } from '../controllers/usarPedido'
import '../styles/VistaMenu.css'
import { useEffect, useState } from 'react'

export default function VistaMenu({ pedido, ir, cerrarSesion, usuario }) {
  const [opcionesElegidas, setOpcionesElegidas] = useState({});
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [avisoAgregado, setAvisoAgregado] = useState('');
  const cantidad = pedido.carrito.reduce((s, x) => s + x.cantidad, 0);

  useEffect(() => {
    if (!productoSeleccionado) return undefined;
    const cerrarConEscape = (evento) => {
      if (evento.key === 'Escape') setProductoSeleccionado(null);
    };
    document.addEventListener('keydown', cerrarConEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', cerrarConEscape);
      document.body.style.overflow = '';
    };
  }, [productoSeleccionado]);

  useEffect(() => {
    if (!avisoAgregado) return undefined;
    const temporizador = window.setTimeout(() => setAvisoAgregado(''), 1800);
    return () => window.clearTimeout(temporizador);
  }, [avisoAgregado]);

  const agregarProducto = (producto) => {
    const opcion = opcionesElegidas[producto.id];
    if (producto.opciones && !opcion) return;
    pedido.agregar(producto.opciones
      ? { ...producto, id: `${producto.id}-${opcion}`, nombre: `${producto.nombre} (${opcion})`, descripcion: `${producto.descripcion} Opción: ${opcion}.` }
      : producto);
    setAvisoAgregado(`${producto.nombre} agregado al carrito`);
    setProductoSeleccionado(null);
  };

  return (
    <main className="pagina-tienda">
      <Cabecera ir={ir} cantidad={cantidad} cerrarSesion={cerrarSesion} />
      <section className="hero-menu">
        <div>
          <span className="etiqueta">CHICKEN BROASTER</span>
          <h1>¡Bienvenido!</h1>
          <p>Hola, {usuario?.nombres?.split(' ')[0] || 'qué bueno verte'} 👋 Revisa nuestras promociones de pollo broaster y platos extras.</p>
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
              <button className="foto-producto" type="button" onClick={() => setProductoSeleccionado(p)} aria-label={`Ver foto y detalles de ${p.nombre}`}>
                {p.imagen ? <img src={p.imagen} alt={p.nombre} loading="lazy" /> : <span>{p.icono}</span>}
                <small>{p.categoria}</small>
              </button>
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
                  <button aria-label={`Agregar ${p.nombre}`} disabled={p.opciones && !opcionesElegidas[p.id]} onClick={() => agregarProducto(p)}>
                    ＋ Agregar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </section>

      {productoSeleccionado && (
        <div className="visor-producto-fondo" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setProductoSeleccionado(null); }}>
          <section className="visor-producto" role="dialog" aria-modal="true" aria-labelledby="visor-producto-titulo">
            <button className="visor-cerrar" type="button" onClick={() => setProductoSeleccionado(null)} aria-label="Cerrar imagen">×</button>
            <div className="visor-foto">
              {productoSeleccionado.imagen
                ? <img src={productoSeleccionado.imagen} alt={productoSeleccionado.nombre} />
                : <span>{productoSeleccionado.icono}</span>}
            </div>
            <div className="visor-info">
              <span>{productoSeleccionado.categoria}</span>
              <h2 id="visor-producto-titulo">{productoSeleccionado.nombre}</h2>
              <p>{productoSeleccionado.descripcion}</p>
              {productoSeleccionado.opciones && (
                <label className="selector-opcion">
                  <span>{productoSeleccionado.opcionEtiqueta}</span>
                  <select value={opcionesElegidas[productoSeleccionado.id] || ''} onChange={(evento) => setOpcionesElegidas((actual) => ({ ...actual, [productoSeleccionado.id]: evento.target.value }))}>
                    <option value="">Seleccionar</option>
                    {productoSeleccionado.opciones.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                  </select>
                </label>
              )}
              <div className="visor-acciones">
                <b>{formatoPesos(productoSeleccionado.precio)}</b>
                <button type="button" disabled={productoSeleccionado.opciones && !opcionesElegidas[productoSeleccionado.id]} onClick={() => agregarProducto(productoSeleccionado)}>＋ Agregar</button>
              </div>
            </div>
          </section>
        </div>
      )}
      
      {cantidad > 0 && (
        <>
          {avisoAgregado && <div className="aviso-agregado" role="status">✓ {avisoAgregado}</div>}
          <button className="carrito-flotante" onClick={() => ir('carrito')} aria-live="polite">
          <span>🛒 Ver carrito</span>
          <b>{cantidad} · {formatoPesos(pedido.subtotal)}</b>
          </button>
        </>
      )}
    </main>
  );
}
