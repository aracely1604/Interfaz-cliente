import { formatoPesos, Logo } from './Componentes'
import '../styles/VistaCarrito.css'

export default function VistaCarrito({ pedido, ir }) {
  return (
    <main className="pagina-simple fondo-gris">
      <div className="barra-superior">
        <Logo />
        <button className="enlace" onClick={() => ir('menu')}>
          ← Seguir comprando
        </button>
      </div>
      <section className="flujo">
        <div className="pasos">
          <b>1</b>
          <span>Tu carrito</span>
          <i></i>
          <b className="apagado">2</b>
          <span>Entrega y pago</span>
          <i></i>
          <b className="apagado">3</b>
          <span>Confirmación</span>
        </div>
        <div className="dos-columnas">
          <div>
            <h1>Tu carrito</h1>
            <p>Revisa que esté todo lo que se te antojó.</p>
            <div className="lista-carrito">
              {pedido.carrito.length === 0 ? (
                <div className="vacio">
                  🛒
                  <h3>Tu carrito está vacío</h3>
                  <button className="boton-secundario" onClick={() => ir('menu')}>
                    Ver el menú
                  </button>
                </div>
              ) : (
                pedido.carrito.map((item) => (
                  <article key={item.id}>
                    <span className="emoji-item">{item.icono}</span>
                    <div>
                      <h3>{item.nombre}</h3>
                      <p>{formatoPesos(item.precio)} c/u</p>
                    </div>
                    <div className="cantidad">
                      <button onClick={() => pedido.cambiarCantidad(item.id, -1)}>−</button>
                      <b>{item.cantidad}</b>
                      <button onClick={() => pedido.cambiarCantidad(item.id, 1)}>＋</button>
                    </div>
                    <strong>{formatoPesos(item.precio * item.cantidad)}</strong>
                  </article>
                ))
              )}
            </div>
          </div>
          <aside className="resumen">
            <h2>Resumen del pedido</h2>
            <div>
              <span>Subtotal</span>
              <b>{formatoPesos(pedido.subtotal)}</b>
            </div>
            <div>
              <span>Delivery</span>
              <b>{formatoPesos(pedido.delivery)}</b>
            </div>
            <hr />
            <div className="total">
              <span>Total</span>
              <b>{formatoPesos(pedido.total)}</b>
            </div>
            <small>🛵 Entrega estimada: 35–50 min</small>
            <button 
              className="boton-primario" 
              disabled={!pedido.carrito.length} 
              onClick={() => ir('entrega')}
            >
              Continuar pedido →
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
