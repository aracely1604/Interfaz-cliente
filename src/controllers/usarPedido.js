import { useEffect, useMemo, useState } from 'react'
import { escucharHistorialPedidos, guardarPedido } from '../models/modeloCliente'

export const productos = [
  { id: 1, nombre: '1/4 pollo broaster con arroz, papas y tallarines', descripcion: '2 presas: 1 truto corto y 1 truto largo. Incluye arroz, papas fritas y tallarines.', precio: 6000, icono: '🍗', categoria: 'Pollo broaster' },
  { id: 2, nombre: '1/4 pollo broaster con arroz chaufa y papas', descripcion: '2 presas: 1 truto corto y 1 truto largo. Acompañado de arroz chaufa y papas fritas.', precio: 7000, icono: '🍗', categoria: 'Pollo broaster' },
  { id: 3, nombre: '1/4 pollo broaster con papas fritas', descripcion: '2 presas: 1 truto corto y 1 truto largo, acompañado de papas fritas.', precio: 7000, icono: '🍗', categoria: 'Pollo broaster' },
  { id: 4, nombre: '1/4 pollo broaster BBQ con papas fritas', descripcion: '2 presas: 1 truto corto y 1 truto largo, bañados en salsa BBQ y acompañados de papas fritas.', precio: 7500, icono: '🍗', categoria: 'Pollo broaster' },
  { id: 5, nombre: '4 alitas broaster BBQ con papas', descripcion: '4 alitas broaster bañadas en salsa BBQ, acompañadas de papas fritas.', precio: 7500, icono: '🍗', categoria: 'Pollo broaster' },
  { id: 6, nombre: 'Promo 2: 4 presas de pollo broaster', descripcion: 'Incluye 4 presas de pollo broaster, arroz, tallarines y papas fritas.', precio: 9500, icono: '🍗', categoria: 'Promociones' },
  { id: 7, nombre: 'Promo 3: 10 presas de pollo broaster', descripcion: 'Incluye 10 presas de pollo, una bandeja de papas fritas, una bandeja de arroz y una bebida de 1,5 L.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige la bebida', precio: 25000, icono: '🍗', categoria: 'Promociones' },
  { id: 8, nombre: 'Promoción familiar', descripcion: 'Incluye 8 presas de pollo broaster, una bandeja de papas fritas, una bandeja de arroz y una bebida de 1,5 L.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige la bebida', precio: 22000, icono: '🍗', categoria: 'Promociones' },
  { id: 9, nombre: 'Promoción familiar especial', descripcion: 'Incluye 8 presas de pollo broaster, una bandeja de papas fritas, una bandeja de arroz chaufa y una bebida de 1,5 L.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige la bebida', precio: 25000, icono: '🍗', categoria: 'Promociones' },
  ...[
    ['Pichanga', [7500, 10000, 14000, 17000, 21000], 'Pichanga.'],
    ['Chorrellana', [7500, 10000, 14000, 17000, 22000], 'Chorrellana.'],
    ['Pique macho', [7500, 10000, 14000, 17000, 22000], 'Pique macho.'],
  ].flatMap(([nombre, precios, descripcion]) => precios.map((precio, i) => ({ nombre: `${nombre} · tamaño ${i + 1}`, descripcion, precio, icono: '🍽️', categoria: 'Platos y tablas', id: `${nombre}-${i}` }))),
  { id: 10, nombre: 'Milanesa de pollo o carne', descripcion: 'Milanesa a elección: pollo o carne.', precio: 7500, icono: '🍽️', categoria: 'Platos' },
  { id: 11, nombre: 'Bistec a lo pobre', descripcion: 'Bistec servido al estilo a lo pobre.', precio: 8500, icono: '🍽️', categoria: 'Platos' },
  { id: 12, nombre: 'Silpancho', descripcion: 'Silpancho.', precio: 7500, icono: '🍽️', categoria: 'Platos' },
  { id: 13, nombre: 'Pechuga a la plancha', descripcion: 'Pechuga de pollo preparada a la plancha.', precio: 7500, icono: '🍗', categoria: 'Platos' },
  { id: 14, nombre: 'Tallarín salteado de pollo', descripcion: 'Tallarines salteados con pollo.', precio: 7500, icono: '🍜', categoria: 'Platos' },
  { id: 15, nombre: 'Tallarín salteado de camarón', descripcion: 'Tallarines salteados con camarón.', precio: 8500, icono: '🍜', categoria: 'Platos' },
  { id: 16, nombre: 'Lomo salteado', descripcion: 'Lomo salteado.', precio: 8500, icono: '🍽️', categoria: 'Platos' },
  { id: 17, nombre: 'Arroz chaufa de pollo o carne', descripcion: 'Arroz chaufa a elección: pollo o carne.', precio: 8500, icono: '🍚', categoria: 'Platos' },
  { id: 18, nombre: 'Arroz chaufa de camarón', descripcion: 'Arroz chaufa con camarón.', precio: 8500, icono: '🍚', categoria: 'Platos' },
  ...[['Chica', 9500], ['Mediana', 10500], ['Grande', 13500], ['Extra grande', 16500], ['Extra súper', 20000]].map(([tamano, precio], i) => ({ id: `salchipapas-${i}`, nombre: `Salchipapas ${tamano.toLowerCase()} + jugo 1,5 L de regalo`, descripcion: `Porción de salchipapas tamaño ${tamano.toLowerCase()} e incluye un jugo de 1,5 L de regalo.`, precio, icono: '🍟', categoria: 'Salchipapas' })),
  { id: 19, nombre: 'Papas fritas caseras · porción chica', descripcion: 'Porción chica de papas fritas caseras.', precio: 5000, icono: '🍟', categoria: 'Acompañamientos' },
  { id: 20, nombre: 'Papas fritas caseras · porción mediana', descripcion: 'Porción mediana de papas fritas caseras.', precio: 9000, icono: '🍟', categoria: 'Acompañamientos' },
  { id: 21, nombre: 'Papas fritas con tocino y cheddar · porción chica', descripcion: 'Papas fritas con tocino y queso cheddar.', precio: 9500, icono: '🍟', categoria: 'Acompañamientos' },
  { id: 22, nombre: 'Papas fritas con tocino y cheddar · porción grande', descripcion: 'Papas fritas con tocino y queso cheddar.', precio: 14000, icono: '🍟', categoria: 'Acompañamientos' },
  { id: 23, nombre: 'Salchi pollo · porción chica', descripcion: 'Salchipapas con pollo.', precio: 7000, icono: '🍟', categoria: 'Salchipollo' },
  { id: 24, nombre: 'Salchi pollo · porción grande', descripcion: 'Salchipapas con pollo.', precio: 8500, icono: '🍟', categoria: 'Salchipollo' },
  { id: 25, nombre: 'Hamburguesa normal', descripcion: 'Hamburguesa de vacuno, queso cheddar, lechuga, tomate, cebolla en aros y salsa de la casa. Incluye papas fritas.', precio: 7500, icono: '🍔', categoria: 'Hamburguesas' },
  { id: 26, nombre: 'Hamburguesa crispy', descripcion: 'Filete de pollo crispy, lechuga, tomate, cebolla en aros, tocino, queso cheddar, pepinillo y salsa BBQ. Incluye papas fritas.', precio: 8500, icono: '🍔', categoria: 'Hamburguesas' },
  { id: 27, nombre: 'Hamburguesa especial', descripcion: 'Hamburguesa de vacuno, lechuga, tomate, cebolla caramelizada, huevo, tocino y queso cheddar. Incluye papas fritas.', precio: 9000, icono: '🍔', categoria: 'Hamburguesas' },
  { id: 28, nombre: 'Hamburguesa Monster', descripcion: 'Doble hamburguesa de vacuno, doble queso cheddar, salchicha, lechuga, tomate, tocino y salsa de la casa. Incluye papas fritas.', precio: 12900, icono: '🍔', categoria: 'Hamburguesas' },
  { id: 29, nombre: 'Bebida 1,5 L', descripcion: 'Bebida de 1,5 litros.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige el sabor', precio: 2800, icono: '🥤', categoria: 'Bebidas' },
  { id: 30, nombre: 'Jugo 1,5 L', descripcion: 'Jugo de 1,5 L..', precio: 2800, icono: '🧃', categoria: 'Bebidas' },
  { id: 31, nombre: 'Bebida 1/2 L', descripcion: 'Bebida de medio litro.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige el sabor', precio: 1600, icono: '🥤', categoria: 'Bebidas' },
  { id: 32, nombre: 'Bebida en lata', descripcion: 'Bebida en lata.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige el sabor', precio: 1400, icono: '🥤', categoria: 'Bebidas' },
  { id: 33, nombre: 'Agua', descripcion: 'Agua embotellada.', opciones: ['Sin gas', 'Con gas'], opcionEtiqueta: 'Elige el tipo', precio: 1200, icono: '💧', categoria: 'Bebidas' },
  { id: 34, nombre: 'Energética Red Bull', descripcion: 'Lata de bebida energética Red Bull.', precio: 2000, icono: '🥤', categoria: 'Bebidas' },
]

export function usePedido(usuario) {
  const [carrito, setCarrito] = useState([]); 
  const [enviando, setEnviando] = useState(false); 
  const [confirmado, setConfirmado] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [datosEntregaSugeridos, setDatosEntregaSugeridos] = useState(null);

  useEffect(() => {
    if (!usuario?.uid) {
      setHistorial([]);
      return undefined;
    }

    setCargandoHistorial(true);
    return escucharHistorialPedidos(
      usuario.uid,
      (pedidos) => {
        setHistorial(pedidos);
        setCargandoHistorial(false);
      },
      () => setCargandoHistorial(false),
    );
  }, [usuario?.uid]);

  const agregar = (producto) => setCarrito((actual) => { 
    const item = actual.find((x) => x.id === producto.id); 
    return item 
      ? actual.map((x) => x.id === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x) 
      : [...actual, { ...producto, cantidad: 1 }];
  });

  const cambiarCantidad = (id, cambio) => setCarrito((a) => 
    a.map((x) => x.id === id ? { ...x, cantidad: x.cantidad + cambio } : x)
     .filter((x) => x.cantidad > 0)
  );

  const repetirPedido = (pedidoAnterior) => {
    const productosAnteriores = pedidoAnterior?.productos || [];
    setCarrito(productosAnteriores.map((producto) => ({ ...producto, cantidad: Math.max(1, Number(producto.cantidad) || 1) })));
    setDatosEntregaSugeridos(pedidoAnterior?.entrega || null);
  };

  const subtotal = useMemo(() => carrito.reduce((s, x) => s + x.precio * x.cantidad, 0), [carrito]); 
  const delivery = 3000; 
  const total = subtotal + delivery;

  const finalizar = async (datos, usuario) => { 
    setEnviando(true); 
    try { 
      await guardarPedido({ 
        clienteId: usuario?.uid || null, 
        clienteCorreo: usuario?.correo || null,
        productos: carrito, 
        subtotal, 
        delivery, 
        total, 
        entrega: datos, 
        metodoPago: datos.metodoPago, 
        montoEfectivo: datos.metodoPago === 'efectivo' ? Number(datos.montoEfectivo) : null 
      }); 
      setConfirmado(true); 
      setCarrito([]); 
      return true;
    } finally { 
      setEnviando(false);
    } 
  };

  return { 
    carrito, 
    agregar, 
    cambiarCantidad, 
    subtotal, 
    delivery, 
    total, 
    enviando, 
    confirmado, 
    historial,
    cargandoHistorial,
    datosEntregaSugeridos,
    repetirPedido,
    finalizar, 
    vaciarCarrito: () => setCarrito([]) 
  };
}
