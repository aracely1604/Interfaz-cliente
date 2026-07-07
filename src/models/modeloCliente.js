import {
  createUserWithEmailAndPassword,
  deleteUser,
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

const leerLocales = () => JSON.parse(localStorage.getItem(CLAVE) || '[]');

const guardarLocales = (clientes) => localStorage.setItem(CLAVE, JSON.stringify(clientes));

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

    return {
      uid: credencial.user.uid,
      ...datos,
      contrasena: undefined
    };
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

    return {
      uid: credencial.user.uid,
      ...ficha.data()
    };
  }

  const cliente = leerLocales().find(
    (c) => c.correo === correo.toLowerCase() && c.contrasena === contrasena
  );

  if (!cliente) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  return cliente;
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

export const salir = () =>
  firebaseConfigurado
    ? signOut(autenticacionFirebase)
    : Promise.resolve();
