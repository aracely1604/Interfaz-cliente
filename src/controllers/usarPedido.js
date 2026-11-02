import { useEffect, useMemo, useState } from 'react'
import { escucharHistorialPedidos, guardarPedido } from '../models/modeloCliente'

export const productos = [
  { id: 1, nombre: '1/4 pollo broaster con arroz, papas y tallarines', descripcion: '2 presas: 1 truto corto y 1 truto largo. Incluye arroz, papas fritas y tallarines.', precio: 6500, imagen: '/menu/imagen-5.jpeg', icono: '🍗', categoria: 'Pollo broaster' },
  { id: 2, nombre: '1/4 pollo broaster con arroz chaufa y papas', descripcion: '2 presas: 1 truto corto y 1 truto largo. Acompañado de arroz chaufa y papas fritas.', precio: 7500, imagen: '/menu/imagen-9.jpeg', icono: '🍗', categoria: 'Pollo broaster' },
  { id: 3, nombre: '1/4 pollo broaster con papas fritas', descripcion: '2 presas: 1 truto corto y 1 truto largo, acompañado de papas fritas.', precio: 7000, imagen: '/menu/imagen-2.jpeg', icono: '🍗', categoria: 'Pollo broaster' },
  { id: 4, nombre: '1/4 pollo broaster BBQ con papas fritas', descripcion: '2 presas: 1 truto corto y 1 truto largo, bañados en salsa BBQ y acompañados de papas fritas.', precio: 7500, imagen: '/menu/imagen-8.jpeg', icono: '🍗', categoria: 'Pollo broaster' },
  { id: 5, nombre: '4 alitas broaster BBQ con papas', descripcion: '4 alitas broaster bañadas en salsa BBQ, acompañadas de papas fritas.', precio: 7500, imagen: '/menu/imagen-8.jpeg', icono: '🍗', categoria: 'Pollo broaster' },
  { id: 6, nombre: 'Promo 2: 4 presas de pollo broaster', descripcion: 'Incluye 4 presas de pollo broaster, arroz, tallarines y papas fritas.', precio: 9500, imagen: '/menu/imagen-1.jpeg', icono: '🍗', categoria: 'Promociones' },
  { id: 7, nombre: 'Promo 3: 10 presas de pollo broaster', descripcion: 'Incluye 10 presas de pollo, una bandeja de papas fritas, una bandeja de arroz y una bebida de 1,5 L.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige la bebida', precio: 25000, imagen: '/menu/imagen-6.jpeg', icono: '🍗', categoria: 'Promociones' },
  { id: 8, nombre: 'Promoción familiar', descripcion: 'Incluye 8 presas de pollo broaster, una bandeja de papas fritas, una bandeja de arroz y una bebida de 1,5 L.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige la bebida', precio: 22000, imagen: '/menu/imagen-7.jpeg', icono: '🍗', categoria: 'Promociones' },
  { id: 9, nombre: 'Promoción familiar especial', descripcion: 'Incluye 8 presas de pollo broaster, una bandeja de papas fritas, una bandeja de arroz chaufa y una bebida de 1,5 L.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige la bebida', precio: 25000, imagen: '/menu/imagen-3.jpeg', icono: '🍗', categoria: 'Promociones' },
  ...[
    ['Pichanga', [7500, 10000, 14000, 17000, 21000], 'Pichanga.', '/menu/imagen-19.jpeg'],
    ['Chorrillana', [7500, 10000, 14000, 17000, 22000], 'Chorrillana.', '/menu/imagen-22.jpeg'],
    ['Pique macho', [7500, 10000, 14000, 17000, 22000], 'Pique macho.', '/menu/imagen-20.jpeg'],
  ].flatMap(([nombre, precios, descripcion, imagen]) => precios.map((precio, i) => ({ nombre: `${nombre} · tamaño ${i + 1}`, descripcion, precio, imagen, icono: '🍽️', categoria: 'Platos y tablas', id: `${nombre}-${i}` }))),
  { id: 10, nombre: 'Milanesa de pollo o carne', descripcion: 'Milanesa a elección: pollo o carne.', opciones: ['Pollo', 'Carne'], opcionEtiqueta: 'Elige el tipo', precio: 7500, imagen: '/menu/imagen-14.jpeg', icono: '🍽️', categoria: 'Platos' },
  { id: 11, nombre: 'Bistec a lo pobre', descripcion: 'Bistec servido al estilo a lo pobre.', precio: 8500, imagen: '/menu/imagen-17.jpeg', icono: '🍽️', categoria: 'Platos' },
  { id: 12, nombre: 'Silpancho', descripcion: 'Silpancho.', precio: 7500, imagen: '/menu/imagen-18.jpeg', icono: '🍽️', categoria: 'Platos' },
  { id: 14, nombre: 'Tallarín salteado de pollo o carne', descripcion: 'Tallarines salteados a elección: pollo o carne.', opciones: ['Pollo', 'Carne'], opcionEtiqueta: 'Elige la proteína', precio: 8500, imagen: '/menu/imagen-12.jpeg', icono: '🍜', categoria: 'Platos' },
  { id: 16, nombre: 'Lomo salteado', descripcion: 'Lomo salteado.', precio: 8500, imagen: '/menu/imagen-10.jpeg', icono: '🍽️', categoria: 'Platos' },
  { id: 17, nombre: 'Arroz chaufa de pollo o carne', descripcion: 'Arroz chaufa a elección: pollo o carne.', precio: 8500, imagen: '/menu/imagen-11.jpeg', icono: '🍚', categoria: 'Platos' },
  { id: 18, nombre: 'Arroz chaufa de camarón', descripcion: 'Arroz chaufa con camarón.', precio: 8500, imagen: '/menu/imagen-11.jpeg', icono: '🍚', categoria: 'Platos' },
  { id: 25, nombre: 'Hamburguesa normal', descripcion: 'Hamburguesa de vacuno, queso cheddar, lechuga, tomate, cebolla en aros y salsa de la casa. Incluye papas fritas.', precio: 7500, imagen: '/menu/imagen-30.jpeg', icono: '🍔', categoria: 'Hamburguesas' },
  { id: 26, nombre: 'Hamburguesa crispy', descripcion: 'Filete de pollo crispy, lechuga, tomate, cebolla en aros, tocino, queso cheddar, pepinillo y salsa BBQ. Incluye papas fritas.', precio: 8500, imagen: '/menu/imagen-28.jpeg', icono: '🍔', categoria: 'Hamburguesas' },
  { id: 27, nombre: 'Hamburguesa especial', descripcion: 'Hamburguesa de vacuno, lechuga, tomate, cebolla caramelizada, huevo, tocino y queso cheddar. Incluye papas fritas.', precio: 9000, imagen: '/menu/imagen-24.jpeg', icono: '🍔', categoria: 'Hamburguesas' },
  { id: 28, nombre: 'Hamburguesa Monster', descripcion: 'Doble hamburguesa de vacuno, doble queso cheddar, salchicha, lechuga, tomate, tocino y salsa de la casa. Incluye papas fritas.', precio: 12900, imagen: '/menu/imagen-26.jpeg', icono: '🍔', categoria: 'Hamburguesas' },
  { id: 29, nombre: 'Bebida 1,5 L', descripcion: 'Bebida de 1,5 litros.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige el sabor', precio: 2800, imagen: '/menu/bebidas-15l.jfif', icono: '🥤', categoria: 'Bebidas' },
  { id: 30, nombre: 'Jugo 1,5 L', descripcion: 'Jugo Watts de 1,5 litros.', opciones: ['Durazno', 'Naranja', 'Manzana'], opcionEtiqueta: 'Elige el sabor', precio: 2800, imagen: '/menu/jugo-15l.jpg', icono: '🧃', categoria: 'Bebidas' },
  { id: 31, nombre: 'Bebida 1/2 L', descripcion: 'Bebida de medio litro.', opciones: ['Sprite', 'Coca-Cola', 'Fanta'], opcionEtiqueta: 'Elige el sabor', precio: 1600, imagen: '/menu/bebidas-15l.jpg', icono: '🥤', categoria: 'Bebidas' },
  { id: 32, nombre: 'Bebida en lata', descripcion: 'Elige entre las variedades disponibles.', opciones: ['Sprite', 'Coca-Cola', 'Fanta', 'Crush', 'Kem', 'Limón Soda', 'Bilz', 'Pap', '7Up', 'Canada Dry', 'Canada Dry Zero'], opcionEtiqueta: 'Elige el sabor', precio: 1400, imagen: '/menu/bebidas-lata.jpg', icono: '🥤', categoria: 'Bebidas' },
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
    const unidadesExistentes = actual
      .filter((item) => item.id === producto.id)
      .reduce((suma, item) => suma + (Number(item.cantidad) || 0), 0);
    const sinDuplicados = actual.filter((item) => item.id !== producto.id);
    return [...sinDuplicados, { ...producto, cantidad: unidadesExistentes + 1 }];
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
