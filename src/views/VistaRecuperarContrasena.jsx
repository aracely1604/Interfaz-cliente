import { useState } from 'react'
import { Alerta, Campo, Logo, Requisitos } from './Componentes'

export default function VistaRecuperarContrasena({ recuperarContrasena, cargando, error, exito, ir }) {
  const [correo, setCorreo] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    const ok = await recuperarContrasena(correo);
    if (ok) {
      setTimeout(() => ir('inicio'), 4000);
    }
  };

  return (
    <main className="pagina-simple">
      <div className="barra-superior">
        <Logo />
        <button className="enlace" onClick={() => ir('inicio')}>
          ← Volver al inicio
        </button>
      </div>
      
      <section className="tarjeta-formulario">
        <div className="titulo-form">
          <span className="mini-icono">🔑</span>
          <h1>Recupera tu acceso</h1>
          <p>Te enviaremos un enlace seguro para crear una nueva contraseña.</p>
        </div>
        
        <form onSubmit={enviar}>
          <Campo
            etiqueta="Correo electrónico"
            type="email"
            required
            placeholder="tu@correo.cl"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          
          <Alerta error={error} exito={exito} />
          
          <button className="boton-primario" disabled={cargando || exito}>
            {cargando ? 'Enviando...' : 'Enviar enlace →'}
          </button>
        </form>
      </section>
    </main>
  );
}
