import { useEffect, useState } from 'react'
import { formatoPesos, Logo } from './Componentes'
import { escucharHistorialPedidos } from '../models/modeloCliente'
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
  en_reparto: 'en_camino',
  tomado: 'en_camino',
  asignado: 'en_camino',
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

const claveFechaSantiago = (valor) => {
  if (!valor) return ''
  const fecha = typeof valor.toDate === 'function' ? valor.toDate() : new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fecha)
  const parte = (tipo) => partes.find((item) => item.type === tipo)?.value || ''
  return `${parte('year')}-${parte('month')}-${parte('day')}`
}

const esDeHoyEnSantiago = (fecha) => Boolean(fecha) && claveFechaSantiago(fecha) === claveFechaSantiago(new Date())

export default function VistaSeguimiento({ ir, usuario }) {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('activos_hoy')
  const [cantidadVisible, setCantidadVisible] = useState(3)

  useEffect(() => {
    setCargando(true)
    const cancelar = escucharHistorialPedidos(
      usuario?.uid,
      (pedidosActualizados) => {
        setPedidos(pedidosActualizados)
        setError('')
        setCargando(false)
      },
      (err) => {
        console.error('No se pudieron escuchar los pedidos:', err)
        setError('No pudimos actualizar el seguimiento en tiempo real.')
        setCargando(false)
      },
    )

    return () => cancelar()
  }, [usuario?.uid])

  const pedidosActivos = pedidos.filter((pedido) => obtenerEstadoNormalizado(pedido.estado) !== 'entregado')
  const pedidosEntregados = pedidos.filter((pedido) => obtenerEstadoNormalizado(pedido.estado) === 'entregado')
  const pedidosFiltrados = filtroFecha === 'entregados'
    ? pedidosEntregados
    : pedidosActivos.filter((pedido) => esDeHoyEnSantiago(pedido.creadoEn))
  const pedidosVisibles = pedidosFiltrados.slice(0, cantidadVisible)

  return (
    <main className="pagina-simple seguimiento">
      <div className="barra-superior">
        <Logo />
        <button className="enlace" onClick={() => ir('menu')}>
          Volver al menú
        </button>
      </div>
      <section>
        <div className="icono-grande">Pedidos</div>
        <span className="etiqueta">SEGUIMIENTO</span>
        <h1>{cargando ? 'Buscando tus pedidos' : filtroFecha === 'entregados' ? 'Pedidos entregados' : 'Pedidos activos de hoy'}</h1>
        <p>
          {cargando
            ? 'Estamos cargando tus pedidos.'
            : pedidosFiltrados.length
              ? `Mostrando ${pedidosVisibles.length} de ${pedidosFiltrados.length} pedidos.`
              : filtroFecha === 'entregados'
                ? 'Todavía no tienes pedidos entregados.'
                : pedidosActivos.length
                  ? 'No tienes pedidos activos de hoy.'
                  : 'No tienes pedidos activos. Cuando realices uno, aparecerá aquí con su código de entrega.'}
        </p>

        {error && <div className="aviso-seguimiento error">{error}</div>}

        {pedidos.length > 0 && (
          <label className="filtro-seguimiento">
            <span>Filtrar pedidos</span>
            <select value={filtroFecha} onChange={(evento) => { setFiltroFecha(evento.target.value); setCantidadVisible(3); }}>
              <option value="activos_hoy">Pedidos activos hoy</option>
              <option value="entregados">Pedidos entregados</option>
            </select>
          </label>
        )}

        {pedidosVisibles.length > 0 && (
          <div className="lista-seguimiento">
            {pedidosVisibles.map((pedido) => {
              const estadoActual = obtenerEstadoNormalizado(pedido.estado)
              const indiceActivo = pasos.findIndex((paso) => paso.id === estadoActual)
              const pasoActivo = pasos[indiceActivo] || pasos[0]
              const totalProductos = pedido.productos?.reduce((suma, item) => suma + Number(item.cantidad || 0), 0) || 0
              const totalPedido = pedido.totales?.total ?? pedido.total ?? 0
              const codigo = pedido.codigoFinal || pedido.id || '-'
              const auto = pedido.repartidorAuto
                ? [pedido.repartidorAuto.marca, pedido.repartidorAuto.color, pedido.repartidorAuto.patente].filter(Boolean).join(' · ')
                : ''

              return (
                <article className="pedido-seguimiento-card" key={pedido.id || codigo}>
                  <div className="encabezado-pedido-seguimiento">
                    <div>
                      <span>{estadoActual === 'entregado' ? 'Pedido entregado' : `Pedido ${codigo}`}</span>
                      <h2>{pasoActivo.titulo}</h2>
                    </div>
                    <small>Actualizado: {formatearFecha(pedido.actualizadoEn || pedido.creadoEn)}</small>
                  </div>

                  <div className="linea-tiempo">
                    {pasos.map((paso, indice) => (
                      <div className={indice <= indiceActivo ? 'activo' : ''} key={paso.id}>
                        <b>{indice < indiceActivo ? '✓' : indice + 1}</b>
                        <span>{paso.nombre}</span>
                      </div>
                    ))}
                  </div>

                  <div className="panel-seguimiento">
                    <div className="codigo-final-card">
                      <span>Código de entrega</span>
                      <strong>{estadoActual === 'entregado' ? 'Entregado' : codigo}</strong>
                      <p>Entrega este código al repartidor al recibir tu pedido.</p>
                    </div>

                    <div className="resumen-seguimiento">
                      <div><span>Productos</span><b>{totalProductos}</b></div>
                      <div><span>Total</span><b>{formatoPesos(totalPedido)}</b></div>
                      <div><span>Repartidor</span><b>{pedido.repartidorNombre || 'Por asignar'}</b></div>
                      <div><span>Auto</span><b>{auto || 'Por asignar'}</b></div>
                      <div><span>Entrega</span><b>{(pedido.entrega?.tipo || pedido.entrega?.tipoEntrega || pedido.tipoEntrega) === 'presencial' ? 'Retiro presencial' : 'Delivery'}</b></div>
                    </div>
                  </div>

                  {pedido.productos?.length > 0 && (
                    <ul className="productos-seguimiento">
                      {pedido.productos.map((producto, indice) => (
                        <li key={`${producto.id}-${indice}`}>
                          <span>{producto.cantidad} × {producto.nombre}</span>
                          <b>{formatoPesos(producto.subtotal ?? producto.precio * producto.cantidad)}</b>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {!cargando && pedidosFiltrados.length === 0 && !error && (
          <div className="aviso-seguimiento">
            {filtroFecha === 'entregados'
              ? 'Los pedidos aparecerán aquí después de ser entregados.'
              : 'Los pedidos entregados dejan de aparecer en esta lista y puedes verlos en el filtro de entregados.'}
          </div>
        )}

        {pedidosFiltrados.length > cantidadVisible && (
          <button className="boton-primario mostrar-mas-pedidos" onClick={() => setCantidadVisible((actual) => actual + 2)}>
            Mostrar más
          </button>
        )}
      </section>
    </main>
  )
}
