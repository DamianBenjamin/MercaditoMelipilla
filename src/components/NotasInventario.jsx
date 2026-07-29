import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, AlertCircle, Info, CheckCircle2, Check } from 'lucide-react';
import api from '../services/api';

const NotasInventario = () => {
  const [notas, setNotas] = useState([]);
  const [texto, setTexto] = useState('');
  const [prioridad, setPrioridad] = useState('amarillo');

  const ColoresPrioridad = {
    rojo: "bg-red-500",
    amarillo: "bg-amber-500",
    verde: "bg-emerald-500"
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    try {
      const res = await api.get('/api/notas');
      // 🎯 Ordenar por Antigüedad (las más nuevas quedan arriba)
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

  const eliminarNota = async (id) => {
    try {
      await api.delete(`/api/notas/${id}`);
      fetchNotas();
    } catch (err) {
      console.error("Error al eliminar nota:", err);
    }
  };

  return (
    <div className="w-full bg-white border border-[#3D2517]/20 p-5 rounded-[2rem] shadow-xl shadow-[#3D2517]/5 animate-fade-in">
      {/* CABECERA DEL MURO */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-[#D91A3D]/10 rounded-lg text-[#D91A3D]">
          <ClipboardList size={16} />
        </div>
        <h4 className="text-[#3D2517] font-sans font-black uppercase text-xs tracking-wider">
          Muro Compartido
        </h4>
      </div>

      {/* FORMULARIO COMPACTO DE REGISTRO EN UNA SOLA LÍNEA */}
      <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
          <input 
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregarNota()}
            className="w-full text-xs font-bold text-slate-700 bg-transparent outline-none placeholder-slate-300"
            placeholder="Escribir falta o nota rápida..."
          />
          {/* Selector rápido de prioridad en bolitas */}
          <div className="flex gap-1.5 flex-shrink-0 border-l border-slate-100 pl-2">
            {['rojo', 'amarillo', 'verde'].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setPrioridad(col)}
                className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                  prioridad === col ? 'ring-2 ring-[#3D2517] scale-110' : 'opacity-30 hover:opacity-70'
                } ${ColoresPrioridad[col]}`}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={agregarNota} 
          className="w-full py-1.5 bg-[#D91A3D] hover:bg-[#b81431] text-white text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus size={12} /> PUBLICAR NOTA
        </button>
      </div>

      {/* LISTA ULTRACOMPACTA EN FILAS */}
      <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1 divide-y divide-slate-100">
        {notas.length === 0 ? (
          <p className="text-[10px] text-center text-slate-400 uppercase font-black py-4">
            Sin notas registradas
          </p>
        ) : (
          notas.map((nota) => {
            const estaResuelta = nota.resuelta;

            return (
              <div 
                key={nota.id} 
                className={`pt-2 first:pt-0 pb-1.5 px-2 rounded-lg flex items-center justify-between gap-2 transition-all ${
                  estaResuelta 
                    ? 'bg-slate-50/60 text-slate-400' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Check + Indicador Prioridad + Texto de la Nota */}
                <div className="flex items-center gap-2 min-w-0 flex-grow">
                  <button 
                    onClick={() => toggleResuelta(nota.id)}
                    className={`p-0.5 rounded border transition-all cursor-pointer flex-shrink-0 ${
                      estaResuelta 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-white border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                    title={estaResuelta ? "Marcar como pendiente" : "Marcar como resuelta"}
                  >
                    <Check size={10} strokeWidth={3} />
                  </button>

                  {/* Punto indicador de color de prioridad */}
                  <span 
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      estaResuelta ? 'bg-slate-300' : ColoresPrioridad[nota.prioridad] || 'bg-slate-400'
                    }`} 
                    title={`Prioridad: ${nota.prioridad}`}
                  />

                  {/* Texto compacto */}
                  <span className={`text-[11px] font-bold truncate leading-tight ${estaResuelta ? 'line-through opacity-60' : ''}`}>
                    {nota.texto}
                  </span>
                </div>

                {/* Fecha + Botón Eliminar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[9px] font-mono text-slate-400 font-bold whitespace-nowrap">
                    {nota.fecha}
                  </span>

                  <button 
                    onClick={() => eliminarNota(nota.id)} 
                    className="text-slate-300 hover:text-[#D91A3D] transition-colors cursor-pointer p-0.5"
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
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