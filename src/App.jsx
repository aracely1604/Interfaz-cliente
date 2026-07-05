import { useState } from 'react'
import { useAutenticacion } from './controllers/usarAutenticacion'
import { usePedido } from './controllers/usarPedido'
import VistaInicioSesion from './views/VistaInicioSesion'
import VistaRegistro from './views/VistaRegistro'
import VistaRecuperarContrasena from './views/VistaRecuperarContrasena'
import VistaMenu from './views/VistaMenu'
import VistaCarrito from './views/VistaCarrito'
import VistaEntrega from './views/VistaEntrega'
import VistaSeguimiento from './views/VistaSeguimiento'
import './styles/estilos.css'

export default function App() {
  const [vista, setVista] = useState('inicio')
  const autenticacion = useAutenticacion(() => setVista('menu'))
  const pedido = usePedido()

  const ir = (destino) => { setVista(destino); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cerrarSesion = async () => { await autenticacion.cerrarSesion(); pedido.vaciarCarrito(); ir('inicio') }

  if (vista === 'registro') return <VistaRegistro {...autenticacion} ir={ir} />
  if (vista === 'recuperar') return <VistaRecuperarContrasena {...autenticacion} ir={ir} />
  if (vista === 'menu') return <VistaMenu pedido={pedido} ir={ir} cerrarSesion={cerrarSesion} usuario={autenticacion.usuario} />
  if (vista === 'carrito') return <VistaCarrito pedido={pedido} ir={ir} />
  if (vista === 'entrega') return <VistaEntrega pedido={pedido} ir={ir} usuario={autenticacion.usuario} />
  if (vista === 'seguimiento') return <VistaSeguimiento ir={ir} />
  return <VistaInicioSesion {...autenticacion} ir={ir} />
}
