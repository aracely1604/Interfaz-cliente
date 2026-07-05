import { useState } from 'react'
import { buscarPreguntas, iniciarSesion, registrarCliente, restablecerContrasena, salir } from '../models/modeloCliente'

export const patronContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/
const mensaje = (error) => error?.message?.replace('Firebase: ', '') || 'Ocurrió un error. Intenta nuevamente.'

export function useAutenticacion(alIngresar) {
  const [usuario, setUsuario] = useState(null); const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(''); const [exito, setExito] = useState('')
  const ejecutar = async (accion) => { setCargando(true); setError(''); setExito(''); try { return await accion() } catch (e) { setError(mensaje(e)); throw e } finally { setCargando(false) } }
  const ingresar = async (correo, contrasena) => { try { const u = await ejecutar(() => iniciarSesion(correo, contrasena)); setUsuario(u); alIngresar() } catch { /* mensaje visible */ } }
  const registrar = async (datos) => { if (!patronContrasena.test(datos.contrasena)) return setError('La contraseña no cumple todos los requisitos.'); try { const u = await ejecutar(() => registrarCliente(datos)); setUsuario(u); alIngresar() } catch { /* mensaje visible */ } }
  const obtenerPreguntas = (correo) => ejecutar(() => buscarPreguntas(correo))
  const cambiarContrasena = async (correo, respuestas, nueva) => { if (!patronContrasena.test(nueva)) return false; try { await ejecutar(() => restablecerContrasena(correo, respuestas, nueva)); setExito('Contraseña actualizada. Ya puedes iniciar sesión.'); return true } catch { return false } }
  const cerrarSesion = async () => { await salir(); setUsuario(null) }
  return { usuario, cargando, error, exito, setError, ingresar, registrar, obtenerPreguntas, cambiarContrasena, cerrarSesion }
}
