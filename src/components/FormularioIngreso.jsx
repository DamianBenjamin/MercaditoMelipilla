import React, { useState, useEffect } from 'react';
import { PlusCircle, Send, Calendar } from 'lucide-react';
import api from '../services/api';

const FormularioIngreso = ({ form, setForm, onSubmit, mensaje, cargando, actualizarCatalogoKey }) => {
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const obtenerSugerenciasCatalogo = async () => {
    if (form.nombre && form.nombre.trim().length >= 2) {
      try {
        const res = await api.get(`/api/catalogo/buscar?termino=${form.nombre}`);
        setSugerencias(res.data);
      } catch (err) {
        console.error("Error al consultar catálogo maestro:", err);
      }
    } else {
      setSugerencias([]);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(obtenerSugerenciasCatalogo, 250);
    return () => clearTimeout(delayDebounce);
  }, [form.nombre, actualizarCatalogoKey]);

  const nombreEsValido = sugerencias.some(
    (item) => item.nombre.toLowerCase().trim() === form.nombre.toLowerCase().trim()
  );

  return (
    /* 🎨 NUEVO DISEÑO: Mantenemos el blanco limpio para que destaque, pero con un borde sutil marrón chocolate */
    <div className="w-full bg-white border border-[#3D2517]/20 p-6 rounded-[2rem] shadow-xl shadow-[#3D2517]/5 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        {/* 🎨 COLOR CEREZA: Usamos el rojo de la guinda del logo para darle vida y contraste */}
        <div className="p-2 bg-[#D91A3D] rounded-xl text-white shadow-sm shadow-[#D91A3D]/20">
          <PlusCircle size={20} />
        </div>
        <h2 className="text-xl font-bold text-[#3D2517]">Registrar Producto</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Categoría y Tamaño */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Categoría</label>
            <select 
              value={form.categoria}
              onChange={(e) => setForm({...form, categoria: e.target.value})}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D2517]/50 focus:bg-white transition-colors"
            >
              <option value="Sandwich">🥪 Sándwich</option>
              <option value="Pastelería">🍰 Pastelería</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Tamaño</label>
            <select 
              value={form.tamano}
              onChange={(e) => setForm({...form, tamano: e.target.value})}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D2517]/50 focus:bg-white transition-colors"
            >
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
        </div>

        {/* Nombre con Lista Maestra Flotante */}
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nombre</label>
          <input 
            type="text"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D2517]/50 focus:bg-white transition-colors placeholder-slate-300"
            placeholder="Ej: Cheesecake Frambuesa"
            value={form.nombre}
            onChange={(e) => {
              setForm({...form, nombre: e.target.value});
              setMostrarSugerencias(true);
            }}
            onBlur={() => setTimeout(() => setMostrarSugerencias(false), 250)}
            required
          />

          {/* PANEL DE SUGERENCIAS */}
          {mostrarSugerencias && form.nombre.trim().length >= 2 && sugerencias.length > 0 && (
            <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-50 animate-fade-in">
              {sugerencias.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={() => {
                    setForm({ ...form, nombre: item.nombre, categoria: item.categoriaDefecto });
                    setMostrarSugerencias(false);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#FDF6F0] hover:text-[#3D2517] cursor-pointer transition-colors text-left flex justify-between items-center"
                >
                  <span>{item.nombre}</span>
                  <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 font-black uppercase tracking-wider">
                    {item.categoriaDefecto === 'Sandwich' ? '🥪 Sandwich' : '🍰 Pastel'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cantidad a Agregar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div>
            <label className="block text-[10px] font-black text-[#3D2517]/60 uppercase mb-1">Cantidad a Agregar</label>
            <input 
              type="number" 
              min="1"
              className="w-full bg-transparent font-bold text-sm text-slate-800 outline-none border-b border-transparent focus:border-[#3D2517]/30 transition-all"
              placeholder="Ej: 5"
              value={form.cantidad}
              onChange={(e) => setForm({...form, cantidad: parseInt(e.target.value) || 1})}
              required
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={10} className="text-slate-400"/> Elaboración
            </label>
            <input 
              type="date" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:bg-white" 
              value={form.fechaElaboracion}
              onChange={(e) => setForm({...form, fechaElaboracion: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={10} className="text-slate-400"/> Llegada
            </label>
            <input 
              type="date" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:bg-white" 
              value={form.fechaLlegada}
              onChange={(e) => setForm({...form, fechaLlegada: e.target.value})}
              required
            />
          </div>
        </div>

        {/* BOTÓN PRINCIPAL: Rojo Cereza potente en vez de marrón plano */}
        <button 
          type="submit" 
          disabled={cargando || !nombreEsValido} 
          className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
            !nombreEsValido 
              ? 'bg-slate-300 text-slate-500 opacity-80 cursor-not-allowed' 
              : 'bg-[#D91A3D] hover:bg-[#b81431] shadow-md shadow-[#D91A3D]/15 active:scale-95'
          }`}
        >
          {cargando ? "Registrando..." : !nombreEsValido ? "⚠️ Selecciona un nombre válido" : <><Send size={16} /> Guardar en Inventario</>}
        </button>
      </form>

      {mensaje && (
        <div className={`mt-4 p-3 rounded-xl text-xs text-center font-bold ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default FormularioIngreso;