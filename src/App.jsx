import React, { useEffect, useState } from 'react';
import api from './services/api';
import FormularioIngreso from './components/FormularioIngreso';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import { LogOut, MapPin, ShieldAlert } from 'lucide-react';
import AdminCatalogo from './components/AdminCatalogo';

function App() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [actualizarLotesKey, setActualizarLotesKey] = useState(0);
  const [actualizarCatalogoKey, setActualizarCatalogoKey] = useState(0);

  const [sesion, setSesion] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(false);

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
      const res = await api.get('/api/productos/reporte/jerarquico-completo');
      setReporte(res.data);
    } catch (err) {
      console.error("Error backend:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const nombreLocal = localStorage.getItem('nombreLocal');

    if (token && rol) {
      setSesion({ token, rol, nombreLocal });
    }
    fetchReporte();
  }, []);

  const handleLoginSuccess = (datosUsuario) => {
    setSesion(datosUsuario);
    fetchReporte();
  };

  const handleCerrarSesion = () => {
    localStorage.clear();
    setSesion(null);
    setVistaPrevia(false);
    fetchReporte();
  };

  const handleIngreso = async (e) => {
    e.preventDefault();
    if (!sesion || sesion.rol !== 'ROLE_VENTAS') {
      alert("Error: Tu local no tiene permisos para ingresar productos.");
      return;
    }

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

      await api.post('/api/productos', productoData, {
        params: { cantidad: form.cantidad }
      });

      setMensaje({ texto: `¡Éxito! Se ingresaron ${form.cantidad} unidades.`, tipo: "success" });
      setForm({ ...form, nombre: '', cantidad: 1 });
      
      await fetchReporte();
      setActualizarLotesKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al guardar. Revisa tus permisos.", tipo: "error" });
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  const handleEliminar = async (nombreCompleto, categoria, id = null) => {
    if (!sesion || sesion.rol !== 'ROLE_VENTAS') {
      alert("Acceso denegado: Solo el Local 2 (Ventas) puede dar de baja stock.");
      return false;
    }

    const nombreLimpio = nombreCompleto.includes(' (') ? nombreCompleto.split(' (')[0] : nombreCompleto;
    const mensajeConfirmar = id 
      ? `¿Deseas eliminar este lote específico de "${nombreLimpio}"?`
      : `¿Deseas eliminar una unidad de "${nombreLimpio}"?`;

    if (!window.confirm(mensajeConfirmar)) return false; 

    try {
      if (id) {
        await api.delete(`/api/productos/${id}`);
      } else {
        const fechaHoy = new Date().toISOString().split('T')[0];
        await api.delete('/api/productos/eliminar-uno', {
          params: { nombre: nombreLimpio, categoria, fecha: fechaHoy }
        });
      }
      
      await fetchReporte(); 
      setMensaje({ texto: "Inventario actualizado correctamente.", tipo: "success" });
      return true; 
    } catch (err) {
      console.error("Error al eliminar:", err);
      setMensaje({ texto: "No tienes permisos para realizar esta operación.", tipo: "error" });
      return false; 
    } finally {
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  const handleTrozar = async (id) => {
    if (!sesion || sesion.rol !== 'ROLE_VENTAS') {
      alert("Acceso denegado: La fábrica de pasteles no registra trozados en vitrina.");
      return false;
    }

    const cantidadIngresada = window.prompt("¿En cuántas porciones se dividirá este pastel? (Ej: 10, 12, 15):");
    if (cantidadIngresada === null) return false; 

    const totalTrozos = parseInt(cantidadIngresada);
    if (isNaN(totalTrozos) || totalTrozos <= 0) {
      alert("Por favor, ingresa un número de trozos válido.");
      return false;
    }

    try {
      await api.put(`/api/productos/${id}/productoEnteroTrozar`, null, {
        params: { trozos: totalTrozos }
      });

      await fetchReporte();
      setMensaje({ texto: `¡Producto trozado en ${totalTrozos} porciones con éxito!`, tipo: "success" });
      return totalTrozos; 
    } catch (err) {
      console.error("Error al trozar:", err);
      setMensaje({ texto: "Error al procesar. Verifica tus permisos de red.", tipo: "error" });
      return false;
    } finally {
      setTimeout(() => setMensaje(null), 4000);
    }
  };

  const esSoloLectura = vistaPrevia || (sesion && sesion.rol === 'ROLE_PRODUCCION');
  const mostrarFormulario = sesion && sesion.rol === 'ROLE_VENTAS';
  const mostrarBannerMonitoreo = vistaPrevia;

  return (
    <div className="min-h-screen pb-20 bg-[#F5E6D3] relative font-sans">
      
      {!sesion && (
        <LoginView 
          onLoginSuccess={handleLoginSuccess} 
          vistaPrevia={vistaPrevia} 
          setVistaPrevia={setVistaPrevia} 
        />
      )}

      {/* BARRA DE NAVEGACIÓN SUPERIOR MATIZADA */}
      <nav className="bg-[#FAF0E6] border-b-4 border-[#3D2517] p-4 mb-10 shadow-md">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* 🎨 DISEÑO UNIFICADO AL ESTILO DE LOS FORMULARIOS */}
          <div className="bg-[#FAF0E6] border-2 border-[#3D2517] px-6 py-2 shadow-inner text-center font-sans relative overflow-hidden flex flex-col items-center rounded-xl">
            {/* Banner superior que imita las cintas del cartel real */}
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-white bg-[#3D2517] px-4 py-0.5 uppercase rounded">
              <span>—</span> MERCADITO <span>—</span>
            </div>
            {/* Texto principal con tipografía Sans idéntica a los formularios */}
            <h1 className="text-2xl font-black tracking-tighter text-[#3D2517] mt-1.5 uppercase">
              DULCINEA
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-[10px] font-black uppercase tracking-wider ${
              vistaPrevia 
                ? 'bg-amber-100 border-amber-300 text-amber-900' 
                : sesion?.rol === 'ROLE_VENTAS' 
                  ? 'bg-green-100 border-green-300 text-green-900' 
                  : 'bg-[#EAD8C8] border-[#3D2517] text-[#3D2517]'
            }`}>
              <MapPin size={12} />
              {vistaPrevia ? 'Modo: Vista Previa Pública' : `Conectado: ${sesion?.nombreLocal}`}
            </div>

            {(sesion || vistaPrevia) && (
              <button
                onClick={handleCerrarSesion}
                className="p-2 text-[#3D2517] hover:text-white hover:bg-[#3D2517] rounded-xl border-2 border-[#3D2517] transition-all cursor-pointer shadow-sm"
                title="Salir del Sistema"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* CUERPO PRINCIPAL DEL SISTEMA */}
      <main className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {mostrarFormulario ? (
          <div className="lg:col-span-1 flex flex-col gap-6 items-start w-full lg:sticky lg:top-8 z-30">
            <div className="w-full">
              <FormularioIngreso 
                form={form} 
                setForm={setForm} 
                onSubmit={handleIngreso} 
                mensaje={mensaje} 
                cargando={cargando}
                actualizarCatalogoKey={actualizarCatalogoKey}
              />
            </div>
            
            <div className="w-full">
              <AdminCatalogo 
                onCatalogoCambiado={() => setActualizarCatalogoKey(prev => prev + 1)} 
              />
            </div>
          </div>
        ) : mostrarBannerMonitoreo ? (
          <div className="lg:col-span-1 bg-[#FAF0E6] p-6 rounded-[2rem] border-2 border-[#3D2517] shadow-sm text-center animate-fade-in">
            <div className="w-10 h-10 bg-[#3D2517] text-white mx-auto rounded-xl flex items-center justify-center mb-3">
              <ShieldAlert size={20} />
            </div>
            <h5 className="text-xs font-black text-[#3D2517] uppercase tracking-wider">Terminal de Monitoreo</h5>
            <p className="text-[10px] text-[#3D2517]/70 mt-2 leading-relaxed">
              Estás en modo lectura. Desde este terminal puedes supervisar el stock, alertas críticas y coordinar mediante el muro de notas.
            </p>
          </div>
        ) : null}
        
        <div className={(mostrarFormulario || esSoloLectura) ? "lg:col-span-3" : "lg:col-span-4"} w-full>
           <DashboardView 
             reporte={reporte} 
             onEliminar={handleEliminar}
             onTrozar={handleTrozar}
             actualizarLotesKey={actualizarLotesKey}
             esSoloLectura={esSoloLectura}
           />
        </div>
      </main>
    </div>
  );
}

export default App;