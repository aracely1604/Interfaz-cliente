import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  autenticacionFirebase,
  baseDatos,
  firebaseConfigurado
} from './firebase';

const CLAVE = 'chicken_broaster_clientes';
const CLAVE_PEDIDO_ACTUAL = 'chicken_broaster_pedido_actual';
const CLAVE_SESION = 'chicken_broaster_sesion_cliente';

const leerLocales = () => JSON.parse(localStorage.getItem(CLAVE) || '[]');

const guardarLocales = (clientes) => localStorage.setItem(CLAVE, JSON.stringify(clientes));

const guardarSesionLocal = (cliente) => localStorage.setItem(CLAVE_SESION, JSON.stringify(cliente));

const generarCodigoFinal = () => String(Math.floor(1000 + Math.random() * 9000));

export async function registrarCliente(datos) {
  if (firebaseConfigurado) {
    const credencial = await createUserWithEmailAndPassword(
      autenticacionFirebase,
      datos.correo,
      datos.contrasena
    );

    try {
      await setDoc(doc(baseDatos, 'clientes', credencial.user.uid), {
        correo: datos.correo,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        telefono: datos.telefono,
        fechaRegistro: serverTimestamp()
      });
    } catch (error) {
      await deleteUser(credencial.user).catch(() => {});
      throw error;
    }

    const cliente = {
      uid: credencial.user.uid,
      ...datos,
      contrasena: undefined
    };
    guardarSesionLocal(cliente);
    return cliente;
  }

  const clientes = leerLocales();

  if (clientes.some((c) => c.correo === datos.correo.toLowerCase())) {
    throw new Error('Este correo ya está registrado.');
  }

  const cliente = {
    ...datos,
    correo: datos.correo.toLowerCase(),
    uid: crypto.randomUUID()
  };

  guardarLocales([...clientes, cliente]);
  guardarSesionLocal({ ...cliente, contrasena: undefined });

  return cliente;
}

export async function iniciarSesion(correo, contrasena) {
  if (firebaseConfigurado) {
    const credencial = await signInWithEmailAndPassword(
      autenticacionFirebase,
      correo,
      contrasena
    );

    const ficha = await getDoc(doc(baseDatos, 'clientes', credencial.user.uid));

    const cliente = {
      uid: credencial.user.uid,
      ...ficha.data()
    };
    guardarSesionLocal(cliente);
    return cliente;
  }

  const cliente = leerLocales().find(
    (c) => c.correo === correo.toLowerCase() && c.contrasena === contrasena
  );

  if (!cliente) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  guardarSesionLocal({ ...cliente, contrasena: undefined });

  return cliente;
}

export function escucharSesion(alCambiar) {
  if (firebaseConfigurado) {
    return onAuthStateChanged(autenticacionFirebase, async (usuario) => {
      if (!usuario) {
        localStorage.removeItem(CLAVE_SESION);
        alCambiar(null);
        return;
      }

      try {
        const ficha = await getDoc(doc(baseDatos, 'clientes', usuario.uid));
        const cliente = { uid: usuario.uid, ...ficha.data() };
        guardarSesionLocal(cliente);
        alCambiar(cliente);
      } catch {
        alCambiar(null);
      }
    });
  }

  const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');
  alCambiar(sesion);
  return () => {};
}

export const enviarCorreoRecuperacion = async (correo) => {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, correo);
};

export async function guardarPedido(pedido) {
  const codigoFinal = generarCodigoFinal();

  if (firebaseConfigurado) {
    const referencia = await addDoc(collection(baseDatos, 'pedidos'), {
      ...pedido,
      codigoFinal,
      creadoEn: serverTimestamp(),
      estado: 'recibido'
    });
    localStorage.setItem(CLAVE_PEDIDO_ACTUAL, referencia.id);
    return referencia.id;
  }

  const pedidos = JSON.parse(localStorage.getItem('chicken_broaster_pedidos') || '[]');
  const id = crypto.randomUUID();

  localStorage.setItem(
    'chicken_broaster_pedidos',
    JSON.stringify([
      ...pedidos,
      {
        ...pedido,
        id,
        codigoFinal,
        creadoEn: new Date().toISOString(),
        estado: 'recibido',
      }
    ])
  );
  localStorage.setItem(CLAVE_PEDIDO_ACTUAL, id);
  return id;
}

export function escucharPedidoActual(clienteId, alCambiar, alError) {
  const pedidoActualId = localStorage.getItem(CLAVE_PEDIDO_ACTUAL);

  if (firebaseConfigurado && pedidoActualId) {
    return onSnapshot(
      doc(baseDatos, 'pedidos', pedidoActualId),
      (resultado) => alCambiar(resultado.exists() ? { id: resultado.id, ...resultado.data() } : null),
      alError,
    );
  }

  if (firebaseConfigurado && clienteId) {
    const consulta = query(collection(baseDatos, 'pedidos'), where('clienteId', '==', clienteId), orderBy('creadoEn', 'desc'));
    return onSnapshot(
      consulta,
      (resultado) => {
        const pedido = resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }))[0];
        if (pedido) localStorage.setItem(CLAVE_PEDIDO_ACTUAL, pedido.id);
        alCambiar(pedido || null);
      },
      alError,
    );
  }

  const pedidos = JSON.parse(localStorage.getItem('chicken_broaster_pedidos') || '[]');
  const pedido = pedidos.find((item) => item.id === pedidoActualId) || pedidos[pedidos.length - 1] || null;
  alCambiar(pedido);
  return () => {};
}

export function escucharHistorialPedidos(clienteId, alCambiar, alError) {
  if (firebaseConfigurado && clienteId) {
    const consulta = query(collection(baseDatos, 'pedidos'), where('clienteId', '==', clienteId));
    return onSnapshot(
      consulta,
      (resultado) => {
        const pedidos = resultado.docs
          .map((documento) => ({ id: documento.id, ...documento.data() }))
          .sort((a, b) => {
            const fechaA = a.creadoEn?.toDate?.()?.getTime?.() || new Date(a.creadoEn || 0).getTime();
            const fechaB = b.creadoEn?.toDate?.()?.getTime?.() || new Date(b.creadoEn || 0).getTime();
            return fechaB - fechaA;
          });
        alCambiar(pedidos);
      },
      alError,
    );
  }

  const pedidos = JSON.parse(localStorage.getItem('chicken_broaster_pedidos') || '[]')
    .filter((pedido) => pedido.clienteId === clienteId)
    .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
  alCambiar(pedidos);
  return () => {};
}

export const salir = () => {
  localStorage.removeItem(CLAVE_SESION);
  return firebaseConfigurado ? signOut(autenticacionFirebase) : Promise.resolve();
};
