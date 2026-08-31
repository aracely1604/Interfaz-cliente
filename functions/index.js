const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore')
const { randomBytes, scryptSync, timingSafeEqual, createHash } = require('node:crypto')

initializeApp()
const db = getFirestore()
const region = 'southamerica-east1'
const preguntasPermitidas = [
  '¿Cuál es el nombre de tu mascota?',
  '¿Qué profesión querías tener cuando eras infante?',
  '¿Cuál es el nombre de tu amiga o amigo de la infancia?',
]
const normalizar = (valor) => String(valor || '').trim().toLocaleLowerCase('es-CL').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const crearHash = (respuesta) => {
  const sal = randomBytes(16).toString('hex')
  return `${sal}:${scryptSync(normalizar(respuesta), sal, 64).toString('hex')}`
}
const comprobarHash = (respuesta, almacenado) => {
  const [sal, hash] = String(almacenado).split(':')
  if (!sal || !hash) return false
  const calculado = scryptSync(normalizar(respuesta), sal, 64)
  const esperado = Buffer.from(hash, 'hex')
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
}
const validarContrasena = (valor) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(String(valor || ''))
const idCorreo = (correo) => createHash('sha256').update(normalizar(correo)).digest('hex')

exports.guardarPerfilSeguro = onCall({ region }, async (solicitud) => {
  if (!solicitud.auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
  const { nombres, apellidos, telefono, preguntas } = solicitud.data || {}
  if (![nombres, apellidos, telefono].every((x) => String(x || '').trim()) || !Array.isArray(preguntas) || preguntas.length !== 3) {
    throw new HttpsError('invalid-argument', 'Completa todos los datos y las tres respuestas.')
  }
  if (preguntas.some((item, i) => item.pregunta !== preguntasPermitidas[i] || !normalizar(item.respuesta))) {
    throw new HttpsError('invalid-argument', 'Las preguntas de seguridad no son válidas.')
  }
  const usuario = await getAuth().getUser(solicitud.auth.uid)
  const correo = normalizar(usuario.email)
  const datosPublicos = { correo, nombres: String(nombres).trim(), apellidos: String(apellidos).trim(), telefono: String(telefono).trim(), preguntas: preguntasPermitidas, creadoEn: FieldValue.serverTimestamp() }
  const datosPrivados = { uid: usuario.uid, correo, respuestasHash: preguntas.map((x) => crearHash(x.respuesta)), actualizadoEn: FieldValue.serverTimestamp() }
  const lote = db.batch()
  lote.set(db.doc(`clientes/${usuario.uid}`), datosPublicos)
  lote.set(db.doc(`recuperacionPrivada/${idCorreo(correo)}`), datosPrivados)
  await lote.commit()
  return { ok: true }
})

exports.buscarPreguntasSeguridad = onCall({ region }, async (solicitud) => {
  const correo = normalizar(solicitud.data?.correo)
  if (!correo) throw new HttpsError('invalid-argument', 'Ingresa un correo válido.')
  const privado = await db.doc(`recuperacionPrivada/${idCorreo(correo)}`).get()
  if (!privado.exists) throw new HttpsError('not-found', 'No encontramos una cuenta con ese correo.')
  return { preguntas: preguntasPermitidas }
})

exports.restablecerConPreguntas = onCall({ region }, async (solicitud) => {
  const correo = normalizar(solicitud.data?.correo)
  const respuestas = solicitud.data?.respuestas
  const nuevaContrasena = solicitud.data?.nuevaContrasena
  if (!correo || !Array.isArray(respuestas) || respuestas.length !== 3 || !validarContrasena(nuevaContrasena)) {
    throw new HttpsError('invalid-argument', 'Datos de recuperación no válidos.')
  }
  const clave = idCorreo(correo)
  const refIntentos = db.doc(`intentosRecuperacion/${clave}`)
  const refPrivado = db.doc(`recuperacionPrivada/${clave}`)
  const resultado = await db.runTransaction(async (tx) => {
    const [intentosDoc, privadoDoc] = await Promise.all([tx.get(refIntentos), tx.get(refPrivado)])
    if (!privadoDoc.exists) throw new HttpsError('not-found', 'No encontramos una cuenta con ese correo.')
    const intentos = intentosDoc.data() || { fallidos: 0 }
    if (intentos.bloqueadoHasta?.toMillis() > Date.now()) throw new HttpsError('resource-exhausted', 'Demasiados intentos. Espera 15 minutos.')
    const hashes = privadoDoc.data().respuestasHash || []
    const correcto = hashes.length === 3 && hashes.every((hash, i) => comprobarHash(respuestas[i], hash))
    if (!correcto) {
      const fallidos = (intentos.fallidos || 0) + 1
      tx.set(refIntentos, { fallidos: fallidos >= 5 ? 0 : fallidos, bloqueadoHasta: fallidos >= 5 ? Timestamp.fromMillis(Date.now() + 15 * 60 * 1000) : null, actualizadoEn: FieldValue.serverTimestamp() })
      return { correcto: false }
    }
    tx.set(refIntentos, { fallidos: 0, bloqueadoHasta: null, actualizadoEn: FieldValue.serverTimestamp() })
    return { correcto: true, uid: privadoDoc.data().uid }
  })
  if (!resultado.correcto) throw new HttpsError('permission-denied', 'Una o más respuestas no son correctas.')
  await getAuth().updateUser(resultado.uid, { password: nuevaContrasena })
  return { ok: true }
})
