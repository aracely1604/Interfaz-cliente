import { Logo } from './Componentes'
import '../styles/VistaSeguimiento.css'

export default function VistaSeguimiento({ ir }) { 
  return (
    <main className="pagina-simple seguimiento">
      <div className="barra-superior">
        <Logo />
        <button className="enlace" onClick={() => ir('menu')}>
          Volver al menú
        </button>
      </div>
      <section>
        <div className="icono-grande">🛵</div>
        <span className="etiqueta">SEGUIMIENTO</span>
        <h1>Tu pedido va en camino</h1>
        <p>Pronto podrás ver aquí cada etapa de tu pedido en tiempo real.</p>
        
        <div className="linea-tiempo">
          <div className="activo">
            <b>✓</b>
            <span>Pedido recibido</span>
          </div>
          <i></i>
          <div>
            <b>2</b>
            <span>En preparación</span>
          </div>
          <i></i>
          <div>
            <b>3</b>
            <span>En camino</span>
          </div>
          <i></i>
          <div>
            <b>4</b>
            <span>Entregado</span>
          </div>
        </div>
        
        <div className="aviso-diseno">
          ✨ Esta sección es una vista de diseño. El seguimiento en tiempo real se conectará próximamente.
        </div>
        
        <button className="boton-primario" onClick={() => ir('menu')}>
          Volver al menú
        </button>
      </section>
    </main>
  ); 
}