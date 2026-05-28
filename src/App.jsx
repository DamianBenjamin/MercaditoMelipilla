import React, { useEffect, useState } from 'react';
import api from './services/api';
import FormularioIngreso from './components/FormularioIngreso';
import DashboardView from './components/DashboardView';

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
      await fetchReporte();
    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al guardar. Revisa el Backend.", tipo: "error" });
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  const handleEliminar = async (nombreCompleto, categoria, id = null) => {
    const nombreLimpio = nombreCompleto.includes(' (') 
      ? nombreCompleto.split(' (')[0] 
      : nombreCompleto;

    const mensajeConfirmar = id 
      ? `¿Deseas eliminar este lote específico de "${nombreLimpio}"?`
      : `¿Deseas eliminar una unidad de "${nombreLimpio}"?`;

    // Si el usuario cancela, devolvemos false
    if (!window.confirm(mensajeConfirmar)) return false; 

    try {
      if (id) {
        await api.delete(`/productos/${id}`);
      } else {
        const fechaHoy = new Date().toISOString().split('T')[0];
        await api.delete('/productos/eliminar-uno', {
          params: { nombre: nombreLimpio, categoria, fecha: fechaHoy }
        });
      }
      
      await fetchReporte(); 
      setMensaje({ texto: "Inventario actualizado correctamente.", tipo: "success" });
      return true; // <-- ¡CLAVE! Indicamos que sí se borró con éxito
    } catch (err) {
      console.error("Error al eliminar:", err);
      setMensaje({ texto: "No se pudo eliminar el registro.", tipo: "error" });
      return false; // <-- Indicamos que hubo un fallo
    } finally {
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  const handleTrozar = async (id) => {
    const cantidadIngresada = window.prompt("¿En cuántas porciones se dividirá este pastel? (Ej: 10, 12, 15):");
    
    if (cantidadIngresada === null) return false; // Si cancela, devuelve false

    const totalTrozos = parseInt(cantidadIngresada);
    if (isNaN(totalTrozos) || totalTrozos <= 0) {
      alert("Por favor, ingresa un número de trozos válido.");
      return false;
    }

    try {
      await api.put(`/productos/${id}/productoEnteroTrozar`, null, {
        params: { trozos: totalTrozos }
      });

      await fetchReporte();
      setMensaje({ texto: `¡Producto trozado en ${totalTrozos} porciones con éxito!`, tipo: "success" });
      
      return totalTrozos; // Devolvemos el número de trozos al frontend
    } catch (err) {
      console.error("Error al trozar:", err);
      setMensaje({ texto: "No se pudo procesar el trozado. Revisa los requisitos del producto.", tipo: "error" });
      return false;
    } finally {
      // Este bloque SE EJECUTA SIEMPRE para limpiar el cartel después de 4 segundos
      setTimeout(() => setMensaje(null), 4000);
    }
  };

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
             setDetallesGlobal={setReporte} // Auxiliar para sincronización
           />
        </div>
      </main>
    </div>
  );
}

export default App;