import { useEffect, useMemo, useState } from 'react'
import { formatoPesos, Logo } from './Componentes'
import { escucharPedidoActual } from '../models/modeloCliente'
import '../styles/VistaSeguimiento.css'

const pasos = [
  { id: 'recibido', nombre: 'Pedido recibido', titulo: 'Recibimos tu pedido' },
  { id: 'en_camino', nombre: 'En camino', titulo: 'Tu pedido va en camino' },
  { id: 'entregado', nombre: 'Entregado', titulo: 'Pedido entregado' },
]

const estadosEquivalentes = {
  recibido: 'recibido',
  pendiente: 'recibido',
  preparando: 'recibido',
  preparacion: 'recibido',
  listo: 'recibido',
  en_camino: 'en_camino',
  camino: 'en_camino',
  reparto: 'en_camino',
  entregado: 'entregado',
}

const obtenerEstadoNormalizado = (estado) => {
  const clave = String(estado || 'recibido').toLowerCase().replaceAll(' ', '_')
  return estadosEquivalentes[clave] || 'recibido'
}

const formatearFecha = (valor) => {
  if (!valor) return '-'
  const fecha = typeof valor.toDate === 'function' ? valor.toDate() : new Date(valor)
  return Number.isNaN(fecha.getTime()) ? '-' : fecha.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}

export default function VistaSeguimiento({ ir, usuario }) {
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setCargando(true)
    const cancelar = escucharPedidoActual(
      usuario?.uid,
      (pedidoActual) => {
        setPedido(pedidoActual)
        setCargando(false)
      },
      (err) => {
        console.error('No se pudo escuchar el pedido:', err)
        setError('No pudimos actualizar el seguimiento en tiempo real.')
        setCargando(false)
      },
    )

    return () => cancelar()
  }, [usuario?.uid])

  const estadoActual = obtenerEstadoNormalizado(pedido?.estado)
  const indiceActivo = pasos.findIndex((paso) => paso.id === estadoActual)
  const pasoActivo = pasos[indiceActivo] || pasos[0]
  const totalProductos = useMemo(
    () => pedido?.productos?.reduce((suma, item) => suma + Number(item.cantidad || 0), 0) || 0,
    [pedido],
  )
  const autoRepartidor = pedido?.repartidorAuto
  const datosAuto = autoRepartidor
    ? [autoRepartidor.marca, autoRepartidor.color, autoRepartidor.patente].filter(Boolean).join(' · ')
    : ''

  return (
    <main className="pagina-simple seguimiento">
      <div className="barra-superior">
        <Logo />
        <button className="enlace" onClick={() => ir('menu')}>
          Volver al menú
        </button>
      </div>
      <section>
        <div className="icono-grande">Pedido</div>
        <span className="etiqueta">SEGUIMIENTO</span>
        <h1>{cargando ? 'Buscando tu pedido' : pasoActivo.titulo}</h1>
        <p>
          {pedido
            ? `Actualizado: ${formatearFecha(pedido.actualizadoEn || pedido.creadoEn)}`
            : 'Cuando finalices un pedido, verás aquí cada etapa en tiempo real.'}
        </p>

        <div className="linea-tiempo">
          {pasos.map((paso, indice) => (
            <div className={indice <= indiceActivo ? 'activo' : ''} key={paso.id}>
              <b>{indice < indiceActivo ? '✓' : indice + 1}</b>
              <span>{paso.nombre}</span>
            </div>
          ))}
        </div>

        {error && <div className="aviso-seguimiento error">{error}</div>}

        {pedido ? (
          <div className="panel-seguimiento">
            <div className="codigo-final-card">
              <span>Código final</span>
              <strong>{pedido.estado === 'entregado' ? 'Usado' : pedido.codigoFinal || '-'}</strong>
              <p>
                Estos números se le deberán decir al repartidor una vez que esté afuera de tu domicilio.
              </p>
            </div>

            <div className="resumen-seguimiento">
              <div>
                <span>Pedido</span>
                <b>#{pedido.id?.slice(0, 6).toUpperCase()}</b>
              </div>
              <div>
                <span>Productos</span>
                <b>{totalProductos}</b>
              </div>
              <div>
                <span>Total</span>
                <b>{formatoPesos(pedido.total || 0)}</b>
              </div>
              <div>
                <span>Repartidor</span>
                <b>{pedido.repartidorNombre || 'Por asignar'}</b>
              </div>
              <div>
                <span>Auto</span>
                <b>{datosAuto || 'Por asignar'}</b>
              </div>
            </div>
          </div>
        ) : (
          <div className="aviso-seguimiento">No hay un pedido activo para seguir.</div>
        )}

        <button className="boton-primario" onClick={() => ir('menu')}>
          Volver al menú
        </button>
      </section>
    </main>
  )
}
