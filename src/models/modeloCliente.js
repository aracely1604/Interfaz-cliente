import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { autenticacionFirebase, baseDatos, firebaseConfigurado, funcionesFirebase } from './firebase'

const CLAVE = 'chicken_broaster_clientes'
const leerLocales = () => JSON.parse(localStorage.getItem(CLAVE) || '[]')
const guardarLocales = (clientes) => localStorage.setItem(CLAVE, JSON.stringify(clientes))

export async function registrarCliente(datos) {
  if (firebaseConfigurado) {
    const credencial = await createUserWithEmailAndPassword(autenticacionFirebase, datos.correo, datos.contrasena)
    try {
      const guardarPerfil = httpsCallable(funcionesFirebase, 'guardarPerfilSeguro')
      await guardarPerfil({ nombres: datos.nombres, apellidos: datos.apellidos, telefono: datos.telefono, preguntas: datos.preguntas })
    } catch (error) {
      await deleteUser(credencial.user).catch(() => {})
      throw error
    }
    return { uid: credencial.user.uid, ...datos, contrasena: undefined }
  }
  const clientes = leerLocales()
  if (clientes.some((c) => c.correo === datos.correo.toLowerCase())) throw new Error('Este correo ya está registrado.')
  const cliente = { ...datos, correo: datos.correo.toLowerCase(), uid: crypto.randomUUID() }
  guardarLocales([...clientes, cliente])
  return cliente
}

export async function iniciarSesion(correo, contrasena) {
  if (firebaseConfigurado) {
    const credencial = await signInWithEmailAndPassword(autenticacionFirebase, correo, contrasena)
    const ficha = await getDoc(doc(baseDatos, 'clientes', credencial.user.uid))
    return { uid: credencial.user.uid, ...ficha.data() }
  }
  const cliente = leerLocales().find((c) => c.correo === correo.toLowerCase() && c.contrasena === contrasena)
  if (!cliente) throw new Error('Correo o contraseña incorrectos.')
  return cliente
}

export async function buscarPreguntas(correo) {
  if (firebaseConfigurado) {
    const buscar = httpsCallable(funcionesFirebase, 'buscarPreguntasSeguridad')
    const resultado = await buscar({ correo })
    return resultado.data.preguntas
  }
  const cliente = leerLocales().find((c) => c.correo === correo.toLowerCase())
  if (!cliente) throw new Error('No encontramos una cuenta con ese correo.')
  return cliente.preguntas.map(({ pregunta }) => pregunta)
}

export async function restablecerContrasena(correo, respuestas, nuevaContrasena) {
  if (firebaseConfigurado) {
    const restablecer = httpsCallable(funcionesFirebase, 'restablecerConPreguntas')
    await restablecer({ correo, respuestas, nuevaContrasena })
    return
  }
  const clientes = leerLocales(); const indice = clientes.findIndex((c) => c.correo === correo.toLowerCase())
  const correctas = clientes[indice]?.preguntas.every((p, i) => p.respuesta.trim().toLowerCase() === respuestas[i].trim().toLowerCase())
  if (!correctas) throw new Error('Una o más respuestas no son correctas. Revisa e intenta nuevamente.')
  clientes[indice].contrasena = nuevaContrasena; guardarLocales(clientes)
}

export async function guardarPedido(pedido) {
  if (firebaseConfigurado) return addDoc(collection(baseDatos, 'pedidos'), { ...pedido, creadoEn: serverTimestamp(), estado: 'recibido' })
  const pedidos = JSON.parse(localStorage.getItem('chicken_broaster_pedidos') || '[]')
  localStorage.setItem('chicken_broaster_pedidos', JSON.stringify([...pedidos, { ...pedido, id: crypto.randomUUID(), creadoEn: new Date().toISOString() }]))
}

export const salir = () => firebaseConfigurado ? signOut(autenticacionFirebase) : Promise.resolve()
