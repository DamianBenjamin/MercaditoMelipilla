import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, AlertCircle, Info, CheckCircle2, Check } from 'lucide-react';
import api from '../services/api';

const NotasInventario = () => {
  const [notas, setNotas] = useState([]);
  const [texto, setTexto] = useState('');
  const [prioridad, setPrioridad] = useState('amarillo');

  const EstilosPrioridad = {
    rojo: "bg-red-50 border-red-200 text-red-800 shadow-xs",
    amarillo: "bg-amber-50 border-amber-200 text-amber-900 shadow-xs",
    verde: "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs"
  };

  const EtiquetasPrioridad = {
    rojo: { texto: "URGENTE", icono: <AlertCircle size={10} /> },
    amarillo: { texto: "POR AGOTAR", icono: <Info size={10} /> },
    verde: { texto: "INFORMATIVO", icono: <CheckCircle2 size={10} /> }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    try {
      const res = await api.get('/api/notas');
      // 🎯 Ordenar por Antigüedad: De la más reciente a la más antigua
      const notasOrdenadas = (res.data || []).sort((a, b) => b.id - a.id);
      setNotas(notasOrdenadas);
    } catch (err) {
      console.error("Error al cargar notas:", err);
    }
  };

  const agregarNota = async () => {
    if (!texto.trim()) return;
    try {
      const nueva = { 
        texto, 
        prioridad, 
        fecha: new Date().toLocaleDateString('es-CL'), 
        resuelta: false 
      };
      await api.post('/api/notas', nueva);
      setTexto('');
      fetchNotas();
    } catch (err) {
      console.error("Error al agregar nota:", err);
    }
  };

  // 🎯 Alternar el estado Resuelta / Pendiente con un Check
  const toggleResuelta = async (id) => {
    try {
      const notaActual = notas.find(n => n.id === id);
      const notaActualizada = { ...notaActual, resuelta: !notaActual.resuelta };
      await api.put(`/api/notas/${id}`, notaActualizada);
      setNotas(notas.map(n => n.id === id ? notaActualizada : n));
    } catch (err) {
      console.error("Error al cambiar estado de la nota:", err);
    }
  };

  const cambiarColorNota = async (id, nuevaPrioridad) => {
    try {
      const notaActual = notas.find(n => n.id === id);
      const notaActualizada = { ...notaActual, prioridad: nuevaPrioridad };
      await api.put(`/api/notas/${id}`, notaActualizada);
      setNotas(notas.map(n => n.id === id ? notaActualizada : n));
    } catch (err) {
      console.error("Error al cambiar prioridad:", err);
    }
  };

  const eliminarNota = async (id) => {
    try {
      await api.delete(`/api/notas/${id}`);
      fetchNotas();
    } catch (err) {
      console.error("Error al eliminar nota:", err);
    }
  };

  return (
    <div className="w-full bg-white border border-[#3D2517]/20 p-6 rounded-[2rem] shadow-xl shadow-[#3D2517]/5 animate-fade-in">
      {/* CABECERA DEL MURO */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-[#D91A3D]/10 rounded-xl text-[#D91A3D]">
          <ClipboardList size={16} />
        </div>
        <h4 className="text-[#3D2517] font-sans font-black uppercase text-xs tracking-wider">
          Muro Compartido de Notas
        </h4>
      </div>

      {/* FORMULARIO DE PUBLICACIÓN */}
      <div className="space-y-3 mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <textarea 
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full p-3 bg-white text-xs font-bold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#3D2517]/50 resize-none placeholder-slate-300"
          placeholder="Escribir nota o alerta de faltantes..."
          rows="2"
        />
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400">Prioridad:</span>
            <div className="flex gap-3">
              {['rojo', 'amarillo', 'verde'].map((col) => (
                <button
                  key={col}
                  onClick={() => setPrioridad(col)}
                  className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                    prioridad === col ? 'ring-2 ring-[#3D2517] scale-110' : 'opacity-30 hover:opacity-70'
                  } ${col === 'rojo' ? 'bg-red-500' : col === 'amarillo' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
              ))}
            </div>
          </div>
          
          <button 
            onClick={agregarNota} 
            className="w-full py-2.5 bg-[#D91A3D] hover:bg-[#b81431] text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#D91A3D]/15 active:scale-95 cursor-pointer"
          >
            <Plus size={14} /> PUBLICAR NOTA
          </button>
        </div>
      </div>

      {/* LISTA UNIFICADA DE NOTAS (ORDENADAS POR ANTIGÜEDAD) */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {notas.length === 0 ? (
          <p className="text-[10px] text-center text-slate-400 uppercase font-black py-6">
            No hay notas publicadas
          </p>
        ) : (
          notas.map((nota) => {
            const estaResuelta = nota.resuelta;

            return (
              <div 
                key={nota.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  estaResuelta 
                    ? 'bg-slate-100/70 border-slate-200 text-slate-400' 
                    : EstilosPrioridad[nota.prioridad] || 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  {/* Botón de Check "Resuelta" */}
                  <button 
                    onClick={() => toggleResuelta(nota.id)}
                    className={`mt-0.5 p-1 rounded-lg border transition-all cursor-pointer flex-shrink-0 ${
                      estaResuelta 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                        : 'bg-white border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                    title={estaResuelta ? "Marcar como pendiente" : "Marcar como resuelta"}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>

                  {/* Contenido de la Nota */}
                  <div className="flex flex-col gap-1 flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      {estaResuelta ? (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                          ✓ RESUELTA
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter opacity-80">
                          {EtiquetasPrioridad[nota.prioridad]?.icono} {EtiquetasPrioridad[nota.prioridad]?.texto}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs font-bold leading-relaxed break-words ${estaResuelta ? 'line-through opacity-70' : ''}`}>
                      {nota.texto}
                    </p>
                  </div>

                  {/* Botón Eliminar */}
                  <button 
                    onClick={() => eliminarNota(nota.id)} 
                    className="text-slate-300 hover:text-[#D91A3D] transition-colors cursor-pointer flex-shrink-0 p-1"
                    title="Eliminar nota"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Pie de Nota: Fecha + Selector de Color */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/5 text-[9px]">
                  <span className="font-mono font-bold opacity-50 uppercase tracking-wider">
                    {nota.fecha}
                  </span>
                  
                  {!estaResuelta && (
                    <div className="flex gap-1.5 bg-white/70 px-2 py-1 rounded-xl border border-black/5 shadow-xs">
                      {['rojo', 'amarillo', 'verde'].map((col) => (
                        <button 
                          key={col} 
                          onClick={() => cambiarColorNota(nota.id, col)} 
                          className={`w-3.5 h-3.5 rounded-full border border-black/10 transition-all hover:scale-125 cursor-pointer ${
                            col === 'rojo' ? 'bg-red-500' : col === 'amarillo' ? 'bg-amber-500' : 'bg-emerald-500'
                          } ${nota.prioridad === col ? 'ring-2 ring-slate-700 shadow-xs scale-110' : 'opacity-30'}`} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotasInventario;