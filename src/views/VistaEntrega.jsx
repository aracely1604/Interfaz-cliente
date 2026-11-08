import { useEffect, useState } from 'react'
import { Campo, formatoPesos, Logo } from './Componentes'
import '../styles/VistaEntrega.css'

const CLAVE_DATOS_ENTREGA = 'chicken_broaster_datos_entrega_sesion'

const leerDatosEntrega = () => {
  try {
    const guardados = JSON.parse(sessionStorage.getItem(CLAVE_DATOS_ENTREGA) || 'null')
    return guardados && typeof guardados === 'object' ? guardados : {}
  } catch {
    return {}
  }
}

export default function VistaEntrega({ pedido, ir, usuario }) {
  const [datos, setDatos] = useState({ 
    ...leerDatosEntrega(),
    nombre: leerDatosEntrega().nombre || usuario?.nombres || '', 
    apellido: leerDatosEntrega().apellido || usuario?.apellidos || '', 
    tipoEntrega: pedido.tipoEntrega || 'delivery',
    direccion: pedido.datosEntregaSugeridos?.direccion || leerDatosEntrega().direccion || '', 
    referencia: pedido.datosEntregaSugeridos?.referencia || leerDatosEntrega().referencia || '', 
    telefono: leerDatosEntrega().telefono || pedido.datosEntregaSugeridos?.telefono || usuario?.telefono || '', 
    metodoPago: leerDatosEntrega().metodoPago || pedido.datosEntregaSugeridos?.metodoPago || 'efectivo', 
    montoEfectivo: leerDatosEntrega().montoEfectivo || '' 
  });
  
  const [error, setError] = useState('');
  
  useEffect(() => {
    sessionStorage.setItem(CLAVE_DATOS_ENTREGA, JSON.stringify(datos));
  }, [datos]);

  useEffect(() => {
    if (!usuario) return;
    setDatos((actual) => ({
      ...actual,
      nombre: actual.nombre || usuario.nombres || '',
      apellido: actual.apellido || usuario.apellidos || '',
      telefono: actual.telefono || usuario.telefono || '',
    }));
  }, [usuario?.uid, usuario?.nombres, usuario?.apellidos, usuario?.telefono]);

  const cambiar = (campo, valor) => setDatos((actual) => ({ ...actual, [campo]: valor }));

  const cambiarTipoEntrega = (tipoEntrega) => {
    cambiar('tipoEntrega', tipoEntrega);
    pedido.setTipoEntrega(tipoEntrega);
  };

  const enviar = async (e) => { 
    e.preventDefault(); 
    if (datos.metodoPago === 'efectivo' && Number(datos.montoEfectivo) < pedido.total) {
      return setError('El monto en efectivo debe ser igual o mayor al total.');
    }
    setError(''); 
    const datosFinales = datos.tipoEntrega === 'presencial'
      ? { ...datos, direccion: '2752', referencia: 'Retiro presencial en el local' }
      : datos;
    const ok = await pedido.finalizar(datosFinales, usuario); 
    if (ok) ir('seguimiento');
  };

  return (
    <main className="pagina-simple fondo-gris">
      <div className="barra-superior">
        <Logo />
        <button className="enlace" onClick={() => ir('carrito')}>
          ← Volver al carrito
        </button>
      </div>
      <section className="flujo">
        <div className="pasos">
          <b>✓</b>
          <span>Tu carrito</span>
          <i></i>
          <b>2</b>
          <span>Entrega y pago</span>
          <i></i>
          <b className="apagado">3</b>
          <span>Confirmación</span>
        </div>
        <form className="dos-columnas" onSubmit={enviar}>
          <div className="tarjeta-entrega">
            <h1>Datos de entrega</h1>
            <p>¿A dónde llevamos tu pedido?</p>
            <div className="grilla-2">
              <Campo 
                etiqueta="Nombre" 
                required 
                value={datos.nombre} 
                onChange={(e) => cambiar('nombre', e.target.value)} 
              />
              <Campo 
                etiqueta="Apellido" 
                required 
                value={datos.apellido} 
                onChange={(e) => cambiar('apellido', e.target.value)} 
              />
            </div>
            <Campo 
              etiqueta="Teléfono de contacto" 
              type="tel" 
              required 
              value={datos.telefono} 
              onChange={(e) => cambiar('telefono', e.target.value)} 
            />
            
            <h2>¿Cómo quieres pagar?</h2>
            <label className={`opcion-pago ${datos.metodoPago === 'efectivo' ? 'seleccionada' : ''}`}>
              <input 
                type="radio" 
                name="pago" 
                checked={datos.metodoPago === 'efectivo'} 
                onChange={() => cambiar('metodoPago', 'efectivo')} 
              />
              <span>💵</span>
              <div>
                <b>Efectivo</b>
                <small>Indica con cuánto pagarás para llevar tu vuelto justo.</small>
              </div>
            </label>
            
            {datos.metodoPago === 'efectivo' && (
              <Campo 
                etiqueta="Monto con el que pagarás" 
                type="number" 
                min={pedido.total} 
                placeholder={`Mínimo ${pedido.total}`} 
                required 
                value={datos.montoEfectivo} 
                onChange={(e) => cambiar('montoEfectivo', e.target.value)} 
              />
            )}
            
            <label className={`opcion-pago ${datos.metodoPago === 'tarjeta' ? 'seleccionada' : ''}`}>
              <input 
                type="radio" 
                name="pago" 
                checked={datos.metodoPago === 'tarjeta'} 
                onChange={() => cambiar('metodoPago', 'tarjeta')} 
              />
              <span>💳</span>
              <div>
                <b>Tarjeta al recibir</b>
                <small>El repartidor llevará una máquina Transbank. El pago se realiza en la entrega.</small>
              </div>
            </label>

            <h2>¿Cómo quieres recibir tu pedido?</h2>
            <label className={`opcion-pago ${datos.tipoEntrega === 'delivery' ? 'seleccionada' : ''}`}>
              <input type="radio" name="tipoEntrega" checked={datos.tipoEntrega === 'delivery'} onChange={() => cambiarTipoEntrega('delivery')} />
              <span>🛵</span>
              <div><b>Delivery · $3.000</b><small>Lo llevamos a la dirección que indiques.</small></div>
            </label>
            <label className={`opcion-pago ${datos.tipoEntrega === 'presencial' ? 'seleccionada' : ''}`}>
              <input type="radio" name="tipoEntrega" checked={datos.tipoEntrega === 'presencial'} onChange={() => cambiarTipoEntrega('presencial')} />
              <span>🏃</span>
              <div><b>Retiro presencial · Gratis</b><small>Retira tu pedido en la dirección 2752.</small></div>
            </label>
            {datos.tipoEntrega === 'delivery' ? (
              <>
                <Campo 
                  etiqueta="Dirección" 
                  required 
                  placeholder="Calle, número, depto/casa" 
                  value={datos.direccion} 
                  onChange={(e) => cambiar('direccion', e.target.value)} 
                />
                <Campo 
                  etiqueta="Referencia (opcional)" 
                  placeholder="Ej: portón azul, casa esquina" 
                  value={datos.referencia} 
                  onChange={(e) => cambiar('referencia', e.target.value)} 
                />
              </>
            ) : (
              <div className="direccion-retiro"><span>📍 Dirección para retirar</span><strong> Maipu 2752</strong></div>
            )}

            {error && <div className="alerta alerta-error">{error}</div>}
          </div>
          
          <aside className="resumen fijo">
            <h2>Tu pedido</h2>
            {pedido.carrito.map((x) => (
              <div key={x.id}>
                <span>{x.cantidad}× {x.nombre}</span>
                <b>{formatoPesos(x.precio * x.cantidad)}</b>
              </div>
            ))}
            <hr />
            <div>
              <span>Subtotal</span>
              <b>{formatoPesos(pedido.subtotal)}</b>
            </div>
            <div>
              <span>{pedido.tipoEntrega === 'presencial' ? 'Retiro presencial' : 'Delivery'}</span>
              <b>{formatoPesos(pedido.delivery)}</b>
            </div>
            <div className="total">
              <span>Total</span>
              <b>{formatoPesos(pedido.total)}</b>
            </div>
            <button className="boton-primario" disabled={pedido.enviando}>
              {pedido.enviando ? 'Guardando pedido…' : 'Finalizar pedido →'}
            </button>
            <small className="centrado">Al finalizar, tu pedido quedará confirmado.</small>
          </aside>
        </form>
      </section>
    </main>
  );
}
