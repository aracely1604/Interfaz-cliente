import '../styles/Componentes.css'

export const Logo = ({ claro = false }) => (
  <div className={`logo ${claro ? 'logo-claro' : ''}`}>
    <img src="/logo-chicken-broaster.png" alt="Chicken Broaster Calama" />
    <div>
      <b>Chicken Broaster</b>
      <small>CALAMA</small>
    </div>
  </div>
);

export const Campo = ({ etiqueta, ...props }) => (
  <label className="campo">
    <span>{etiqueta}</span>
    <input {...props} />
  </label>
);

export const Alerta = ({ error, exito }) => (
  (error || exito) ? (
    <div className={`alerta ${error ? 'alerta-error' : 'alerta-exito'}`}>
      {error || exito}
    </div>
  ) : null
);

export const Requisitos = ({ valor = '' }) => {
  const reglas = [
    ['6 caracteres', valor.length >= 6],
    ['Una mayúscula', /[A-Z]/.test(valor)],
    ['Una minúscula', /[a-z]/.test(valor)],
    ['Un número', /\d/.test(valor)],
    ['Un símbolo', /[^A-Za-z0-9]/.test(valor)]
  ];
  return (
    <div className="requisitos">
      {reglas.map(([t, ok]) => (
        <span className={ok ? 'cumple' : ''} key={t}>
          {ok ? '✓' : '○'} {t}
        </span>
      ))}
    </div>
  );
};

export const Cabecera = ({ ir, cantidad = 0, cerrarSesion }) => (
  <header className="cabecera">
    <Logo claro />
    <nav>
      <button onClick={() => ir('menu')}>Menú</button>
      <button onClick={() => ir('seguimiento')}>Seguimiento</button>
      <button className="boton-carrito" onClick={() => ir('carrito')}>
        🛒 Carrito <b>{cantidad}</b>
      </button>
      <button className="salir" onClick={cerrarSesion}>Salir</button>
    </nav>
  </header>
);

export const formatoPesos = (valor) => new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP'
}).format(valor);