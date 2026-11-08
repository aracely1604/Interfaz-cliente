import { useEffect, useState } from 'react'
import { iniciarSesion, registrarCliente, enviarCorreoRecuperacion, escucharSesion, salir } from '../models/modeloCliente'

export const patronContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/
const mensaje = (error) => {
  const codigo = error?.code || ''
  const mensajesAutenticacion = {
    'auth/invalid-email': 'Correo incorrecto. Revisa el formato del correo.',
    'auth/user-not-found': 'Correo incorrecto. No encontramos una cuenta con ese correo.',
    'auth/wrong-password': 'Contraseña incorrecta. Inténtalo nuevamente.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos. Revisa tus datos e inténtalo nuevamente.',
  }
  return mensajesAutenticacion[codigo] || error?.message?.replace('Firebase: ', '') || 'Ocurrió un error. Intenta nuevamente.'
}

export function useAutenticacion(alIngresar) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => escucharSesion((sesion) => {
    setUsuario(sesion);
    if (sesion) alIngresar();
  }), [alIngresar]);

  const ejecutar = async (accion) => {
    setCargando(true);
    setError('');
    setExito('');
    try {
      return await accion();
    } catch (e) {
      setError(mensaje(e));
      throw e;
    } finally {
      setCargando(false);
    }
  };

  const ingresar = async (correo, contrasena) => {
    try {
      const u = await ejecutar(() => iniciarSesion(correo, contrasena));
      setUsuario(u);
      alIngresar();
    } catch {
      /* mensaje visible */
    }
  };

  const registrar = async (datos) => {
    if (!patronContrasena.test(datos.contrasena)) {
      return setError('La contraseña no cumple todos los requisitos.');
    }
    try {
      const u = await ejecutar(() => registrarCliente(datos));
      setUsuario(u);
      alIngresar();
    } catch {
      /* mensaje visible */
    }
  };

  const recuperarContrasena = async (correo) => {
    try {
      await ejecutar(() => enviarCorreoRecuperacion(correo));
      setExito('Te enviamos un correo con un enlace para cambiar tu contraseña. (Revisa tu carpeta de spam)');
      return true;
    } catch {
      return false;
    }
  };

  const cerrarSesion = async () => {
    await salir();
    setUsuario(null);
  };

  return {
    usuario,
    cargando,
    error,
    exito,
    setError,
    ingresar,
    registrar,
    recuperarContrasena,
    cerrarSesion
  };
}
