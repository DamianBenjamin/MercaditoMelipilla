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
  esEntero: 'Si',
  stockTrozos: 1,
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
      esEntero: form.esEntero,
      stockTrozos: form.stockTrozos,
      fechaElaboracion: form.fechaElaboracion,
      fechaLlegada: form.fechaLlegada
    };
      await api.post('/productos', productoData, {
      params: { 
        cantidad: form.cantidad
      }
    });

    setMensaje({ texto: `¡Éxito! Se ingresaron ${form.cantidad} unidades.`, tipo: "success" });
    
    setForm({ 
      ...form,
      nombre: '', 
      cantidad: 1 
    });

    fetchReporte();
  } catch (err) {
    console.error(err);
    setMensaje({ texto: "Error al guardar. Revisa que el Backend esté corriendo.", tipo: "error" });
  } finally {
    setCargando(false);
    setTimeout(() => setMensaje(null), 5000);
  }
};

  return (
    <div className="min-h-screen pb-20">
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

      <main className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <FormularioIngreso 
            form={form} 
            setForm={setForm} 
            onSubmit={handleIngreso} 
            mensaje={mensaje}
            cargando={cargando}
          />
        </div>
        
        <div className="md:col-span-2">
           <DashboardView reporte={reporte} />
        </div>
      </main>
    </div>
  );
}

export default App;