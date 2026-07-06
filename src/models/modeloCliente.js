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
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  autenticacionFirebase, 
  baseDatos, 
  firebaseConfigurado 
} from './firebase';

const CLAVE = 'chicken_broaster_clientes';

const leerLocales = () => JSON.parse(localStorage.getItem(CLAVE) || '[]');

const guardarLocales = (clientes) => localStorage.setItem(CLAVE, JSON.stringify(clientes));

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
  if (firebaseConfigurado) {
    return addDoc(collection(baseDatos, 'pedidos'), { 
      ...pedido, 
      creadoEn: serverTimestamp(), 
      estado: 'recibido' 
    });
  }
  
  const pedidos = JSON.parse(localStorage.getItem('chicken_broaster_pedidos') || '[]');
  
  localStorage.setItem(
    'chicken_broaster_pedidos', 
    JSON.stringify([
      ...pedidos, 
      { 
        ...pedido, 
        id: crypto.randomUUID(), 
        creadoEn: new Date().toISOString() 
      }
    ])
  );
}

export const salir = () => 
  firebaseConfigurado 
    ? signOut(autenticacionFirebase) 
    : Promise.resolve();
