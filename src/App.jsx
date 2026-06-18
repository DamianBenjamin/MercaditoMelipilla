import React, { useEffect, useState } from 'react';
import api from './services/api';
import FormularioIngreso from './components/FormularioIngreso';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView'; // IMPORTAMOS TU NUEVO LOGIN
import { LogOut, MapPin, ShieldAlert } from 'lucide-react';

function App() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [actualizarLotesKey, setActualizarLotesKey] = useState(0);

  // ESTADOS NUEVOS PARA LA SEGURIDAD MULTI-LOCAL
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

  // Cargar reporte de forma pública (funciona para todos, incluso en vista previa)
  const fetchReporte = async () => {
    try {
      const res = await api.get('/api/productos/reporte/jerarquico-completo');
      setReporte(res.data);
    } catch (err) {
      console.error("Error backend:", err);
    }
  };

  // Al arrancar, verificamos si ya existía una sesión guardada en el navegador
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
    fetchReporte(); // Recargamos reporte con los permisos frescos
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

  // Evaluamos las restricciones lógicas operacionales
  const esSoloLectura = vistaPrevia || (sesion && sesion.rol === 'ROLE_PRODUCCION');
  const mostrarFormulario = sesion && sesion.rol === 'ROLE_VENTAS';
  const mostrarBannerMonitoreo = vistaPrevia;

  return (
    <div className="min-h-screen pb-20 bg-slate-50 relative">
      
      {/* 🔐 RENDERIZADO DEL LOGIN CONDICIONAL CON DESENFOQUE */}
      {!sesion && (
        <LoginView 
          onLoginSuccess={handleLoginSuccess} 
          vistaPrevia={vistaPrevia} 
          setVistaPrevia={setVistaPrevia} 
        />
      )}

      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="bg-white border-b border-slate-100 p-5 mb-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-black tracking-tighter text-slate-800">
            MERCADITO <span className="text-pink-500">DULCINEA</span>
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Indicador de Entorno de Red Actual */}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
              vistaPrevia 
                ? 'bg-amber-50 border-amber-100 text-amber-700' 
                : sesion?.rol === 'ROLE_VENTAS' 
                  ? 'bg-green-50 border-green-100 text-green-700' 
                  : 'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              <MapPin size={12} />
              {vistaPrevia ? 'Modo: Vista Previa Pública' : `Conectado: ${sesion?.nombreLocal}`}
            </div>

            {/* Botón de Salida */}
            {(sesion || vistaPrevia) && (
              <button
                onClick={handleCerrarSesion}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-100 transition-colors"
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
        
        {/* COLUMNA 1: FORMULARIO (Sólo visible para Local 2) */}
        {mostrarFormulario ? (
          <div className="lg:col-span-1">
            <FormularioIngreso 
              form={form} setForm={setForm} 
              onSubmit={handleIngreso} 
              mensaje={mensaje} cargando={cargando}
            />
          </div>
        ) : mostrarBannerMonitoreo ? ( // 🌟 CAMBIADO AQUÍ: Ahora solo evalúa si es Vista Previa
          <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center animate-fade-in">
            <div className="w-10 h-10 bg-slate-50 text-slate-400 mx-auto rounded-xl flex items-center justify-center mb-3">
              <ShieldAlert size={20} />
            </div>
            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">Terminal de Monitoreo</h5>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Estás en modo lectura. Desde este terminal puedes supervisar el stock, alertas críticas y coordinar mediante el muro de notas. Las acciones de venta y edición están deshabilitadas.
            </p>
          </div>
        ) : null}
        
        {/* COLUMNA 2: DASHBOARD GLOBAL (Ocupa las 3 columnas restantes o las 4 si el formulario se esconde) */}
        <div className={(mostrarFormulario || esSoloLectura) ? "lg:col-span-3" : "lg:col-span-4"}>
           <DashboardView 
             reporte={reporte} 
             onEliminar={handleEliminar}
             onTrozar={handleTrozar}
             actualizarLotesKey={actualizarLotesKey}
             esSoloLectura={esSoloLectura} //👈 INYECTAMOS EL FILTRO AL DASHBOARD
           />
        </div>
      </main>
    </div>
  );
}

export default App;