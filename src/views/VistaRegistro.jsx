import { useState } from 'react'
import { Alerta, Campo, Logo, Requisitos } from './Componentes'
import '../styles/Componentes.css'
// No olvides importar tu CSS global aquí si lo necesitas para otras vistas

export default function VistaRegistro({ registrar, cargando, error, ir }) {
  const [datos, setDatos] = useState({
    correo: '',
    contrasena: '',
    nombres: '',
    apellidos: '',
    telefono: ''
  });

  const cambiar = (campo, valor) => setDatos({ ...datos, [campo]: valor });

  const enviar = (e) => {
    e.preventDefault();
    registrar(datos);
  };

  return (
    <main className="pagina-simple">
      <div className="barra-superior">
        <Logo />
        <button className="enlace" onClick={() => ir('inicio')}>
          ← Volver al inicio
        </button>
      </div>
      <section className="tarjeta-formulario ancha">
        <div className="titulo-form">
          <span className="mini-icono">✨</span>
          <h1>Crea tu cuenta</h1>
          <p>Estás a un paso de tu próximo antojo.</p>
        </div>
        <form onSubmit={enviar}>
          <div className="grilla-2">
            <Campo
              etiqueta="Nombres"
              placeholder="Ej: Camila"
              required
              value={datos.nombres}
              onChange={(e) => cambiar('nombres', e.target.value)}
            />
            <Campo
              etiqueta="Apellidos"
              placeholder="Ej: González Soto"
              required
              value={datos.apellidos}
              onChange={(e) => cambiar('apellidos', e.target.value)}
            />
            <Campo
              etiqueta="Correo electrónico"
              type="email"
              placeholder="tu@correo.cl"
              required
              value={datos.correo}
              onChange={(e) => cambiar('correo', e.target.value)}
            />
            <Campo
              etiqueta="Teléfono"
              type="tel"
              placeholder="+56 9 1234 5678"
              required
              value={datos.telefono}
              onChange={(e) => cambiar('telefono', e.target.value)}
            />
          </div>
          
          <Campo
            etiqueta="Contraseña"
            type="password"
            placeholder="Crea una contraseña segura"
            required
            value={datos.contrasena}
            onChange={(e) => cambiar('contrasena', e.target.value)}
          />
          <Requisitos valor={datos.contrasena} />

          <Alerta error={error} />
          
          <button className="boton-primario" disabled={cargando}>
            {cargando ? 'Creando cuenta…' : 'Crear mi cuenta →'}
          </button>
        </form>
      </section>
    </main>
  );
}