import React, { useEffect, useState } from 'react';
import api from './services/api';
import FormularioIngreso from './components/FormularioIngreso';
import DashboardView from './components/DashboardView';
import NotasInventario from './components/NotasInventario';

function App() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [form, setForm] = useState({ 
    nombre: '', 
    categoria: 'Sandwich', 
    tamano: 'Mediano',
    cantidad: 1,
    fechaElaboracion: new Date().toISOString().split('T')[0],
    fechaLlegada: new Date().toISOString().split('T')[0]
  });

  const fetchReporte = async () => {
    try {
      const res = await api.get('/productos/reporte/jerarquico-completo');
      setReporte(res.data);
    } catch (err) {
      console.error("Error backend:", err);
    }
  };

  useEffect(() => {
    fetchReporte();
  }, []);

  const handleIngreso = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    
    try {
      const productoData = {
        nombre: form.nombre,
        categoria: form.categoria,
        tamano: form.tamano,
        esEntero: 'si',
        stockTrozos: 1,
        fechaElaboracion: form.fechaElaboracion,
        fechaLlegada: form.fechaLlegada
      };

      await api.post('/productos', productoData, {
        params: { cantidad: form.cantidad }
      });

      setMensaje({ texto: `¡Éxito! Se ingresaron ${form.cantidad} unidades.`, tipo: "success" });
      setForm({ ...form, nombre: '', cantidad: 1 });
      fetchReporte();
    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al guardar. Revisa el Backend.", tipo: "error" });
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  // --- FUNCIÓN DE ELIMINACIÓN ACTUALIZADA PARA EL ACORDEÓN ---
  const handleEliminar = async (nombreCompleto, categoria, id = null) => {
    const nombreLimpio = nombreCompleto.includes(' (') 
      ? nombreCompleto.split(' (')[0] 
      : nombreCompleto;

    const mensajeConfirmar = id 
      ? `¿Deseas eliminar este lote específico de "${nombreLimpio}"?`
      : `¿Deseas eliminar una unidad de "${nombreLimpio}"?`;

    if (window.confirm(mensajeConfirmar)) {
      try {
        if (id) {
          // ELIMINACIÓN POR ID (Desde el detalle del acordeón)
          await api.delete(`/productos/${id}`);
        } else {
          // ELIMINACIÓN POR NOMBRE (Lógica antigua o genérica)
          const fechaHoy = new Date().toISOString().split('T')[0];
          await api.delete('/productos/eliminar-uno', {
            params: { nombre: nombreLimpio, categoria, fecha: fechaHoy }
          });
        }
        
        await fetchReporte(); 
        setMensaje({ texto: "Inventario actualizado correctamente.", tipo: "success" });
      } catch (err) {
        console.error("Error al eliminar:", err);
        setMensaje({ texto: "No se pudo eliminar el registro.", tipo: "error" });
      } finally {
        setTimeout(() => setMensaje(null), 4000);
      }
    }
  };

  // --- FUNCIÓN PARA TROZAR (Próximo paso) ---
  const handleTrozar = async (id) => {
  // 1. Pedimos al usuario la cantidad de trozos mediante una ventana emergente
  const cantidadIngresada = window.prompt("¿En cuántas porciones se dividirá este pastel? (Ej: 10, 12, 15):");
  
  // Si el usuario cancela o no escribe nada, detenemos la función
  if (cantidadIngresada === null) return; 

  // Validamos que sea un número válido y mayor a cero
  const totalTrozos = parseInt(cantidadIngresada);
  if (isNaN(totalTrozos) || totalTrozos <= 0) {
    alert("Por favor, ingresa un número de trozos válido.");
    return;
  }

  try {
    // 2. Enviamos el ID y la cantidad de trozos al backend usando params o en el body
    await api.put(`/productos/${id}/productoEnteroTrozar`, null, {
      params: { trozos: totalTrozos }
    });

    await fetchReporte();
    setMensaje({ texto: `¡Producto trozado en ${totalTrozos} porciones con éxito!`, tipo: "success" });
  } catch (err) {
    console.error("Error al trozar:", err);
    setMensaje({ texto: "No se pudo procesar el trozado. Revisa los requisitos del producto.", tipo: "error" });
  } finally {
    setTimeout(() => setMensaje(null), 4000);
  }
  };

  const handleActualizarTrozosDirecto = async (id, cantidadNueva) => {
  try {
    // Buscamos dentro de los detalles cargados en el cliente
    let productoActual = null;
    if (reporte && reporte.detallePorCategoria) {
      for (const cat of Object.values(reporte.detallePorCategoria)) {
      }
    }

    const resProducto = await api.get(`/productos/buscar`); 

    alert("Función conectada. Procediendo a actualizar en DashboardView.");
  } catch (err) {
    console.error(err);
  }
};
  


  const [notas, setNotas] = useState([]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <nav className="bg-white border-b border-slate-100 p-6 mb-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tighter text-slate-800">
            MERCADITO <span className="text-pink-500">DULCINEA</span>
          </h1>
          <div className="px-4 py-1 bg-green-50 rounded-full border border-green-100">
            <span className="text-[10px] font-black text-green-600 uppercase">Sistema Online</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1">
          <FormularioIngreso 
            form={form} setForm={setForm} 
            onSubmit={handleIngreso} 
            mensaje={mensaje} cargando={cargando}
          />
        </div>
        
        <div className="lg:col-span-3">
           <DashboardView 
             reporte={reporte} 
             onEliminar={handleEliminar}
             onTrozar={handleTrozar}
             onActualizarTrozosDirecto={handleActualizarTrozosDirecto}
           />

        </div>
      </main>
    </div>
  );
}

export default App;