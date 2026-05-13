import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, AlertCircle, Info, CheckCircle2 } from 'lucide-react'; // Iconos extra para cada estado
import api from '../services/api';

const NotasInventario = () => {
  const [notas, setNotas] = useState([]);
  const [texto, setTexto] = useState('');
  const [prioridad, setPrioridad] = useState('amarillo');

  const EstilosPrioridad = {
    rojo: "bg-red-50 border-red-200 text-red-700 shadow-[0_0_15px_rgba(239,68,68,0.05)]",
    amarillo: "bg-amber-50 border-amber-200 text-amber-800 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
    verde: "bg-green-50 border-green-200 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
  };

  // Objeto con los textos que me pediste e iconos descriptivos
  const EtiquetasPrioridad = {
    rojo: { texto: "URGENTE", icono: <AlertCircle size={10} /> },
    amarillo: { texto: "POR AGOTAR", icono: <Info size={10} /> },
    verde: { texto: "LISTO / COMPLETADO", icono: <CheckCircle2 size={10} /> }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    try {
      const res = await api.get('/notas');
      setNotas(res.data);
    } catch (err) {
      console.error("Error al cargar notas", err);
    }
  };

  const agregarNota = async () => {
    if (!texto.trim()) return;
    try {
      const nueva = { 
        texto, 
        prioridad, 
        fecha: new Date().toLocaleDateString(), 
        resuelta: false 
      };
      await api.post('/notas', nueva);
      setTexto('');
      fetchNotas();
    } catch (err) {
      console.error("Error al guardar", err);
    }
  };

  const cambiarColorNota = async (id, nuevaPrioridad) => {
    try {
      const notaActual = notas.find(n => n.id === id);
      const notaActualizada = { ...notaActual, prioridad: nuevaPrioridad };
      await api.put(`/notas/${id}`, notaActualizada);
      setNotas(notas.map(n => n.id === id ? notaActualizada : n));
    } catch (err) {
      console.error("Error al cambiar color:", err);
    }
  };

  const eliminarNota = async (id) => {
    try {
      await api.delete(`/notas/${id}`);
      fetchNotas();
    } catch (err) {
      console.error("Error al eliminar", err);
    }
  };

  return (
    <div className="notas-container">
      <div className="flex items-center gap-2 mb-5">
        <ClipboardList size={16} className="text-pink-500" />
        <h4 className="text-slate-800 font-black uppercase text-[10px] tracking-widest">Muro Compartido</h4>
      </div>

      <div className="space-y-4 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
        <textarea 
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="nota-textarea"
          placeholder="Escribir falta..."
          rows="2"
        />
        <div className="flex flex-col gap-3">
          <div className="flex justify-center gap-4 bg-white py-2 rounded-xl border border-slate-100">
            {['rojo', 'amarillo', 'verde'].map((col) => (
              <button
                key={col}
                onClick={() => setPrioridad(col)}
                className={`w-5 h-5 rounded-full transition-transform ${prioridad === col ? 'ring-2 ring-slate-800 scale-110' : 'opacity-40'} ${col === 'rojo' ? 'bg-red-500' : col === 'amarillo' ? 'bg-amber-500' : 'bg-green-500'}`}
              />
            ))}
          </div>
          <button onClick={agregarNota} className="btn-publicar">
            <Plus size={14} className="inline mr-1" /> PUBLICAR
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
        {notas.map((nota) => (
          <div key={nota.id} className={`nota-card ${EstilosPrioridad[nota.prioridad] || 'bg-slate-50'}`}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-col gap-1 flex-1">
                {/* ETIQUETA DE ESTADO DINÁMICA */}
                <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter opacity-70">
                  {EtiquetasPrioridad[nota.prioridad].icono}
                  {EtiquetasPrioridad[nota.prioridad].texto}
                </div>
                <p className="text-[11px] font-bold leading-tight mt-0.5">{nota.texto}</p>
              </div>
              <button onClick={() => eliminarNota(nota.id)} className="text-current opacity-30 hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/5">
              <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">{nota.fecha}</span>
              
              <div className="flex gap-2 bg-white/60 p-1.5 rounded-xl border border-black/5 shadow-inner">
                {['rojo', 'amarillo', 'verde'].map((col) => (
                  <button
                    key={col}
                    onClick={() => cambiarColorNota(nota.id, col)}
                    className={`w-4 h-4 rounded-full border border-black/10 transition-all hover:scale-125 cursor-pointer ${
                      col === 'rojo' ? 'bg-red-500' : col === 'amarillo' ? 'bg-amber-500' : 'bg-green-500'
                    } ${nota.prioridad === col ? 'ring-2 ring-white shadow-sm scale-110' : 'opacity-30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotasInventario;