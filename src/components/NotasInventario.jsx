import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Calendar } from 'lucide-react';

const NotasInventario = () => {
  const [notas, setNotas] = useState(() => {
    const guardadas = localStorage.getItem('notas_dulcinea');
    return guardadas ? JSON.parse(guardadas) : [];
  });
  
  const [texto, setTexto] = useState('');
  const [prioridad, setPrioridad] = useState('amarillo');

  useEffect(() => {
    localStorage.setItem('notas_dulcinea', JSON.stringify(notas));
  }, [notas]);

  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short'
  });

  const agregarNota = () => {
    if (!texto.trim()) return;
    const nuevaNota = {
      id: Date.now(),
      texto: texto,
      prioridad: prioridad,
      fecha: new Date().toLocaleDateString()
    };
    setNotas([nuevaNota, ...notas]);
    setTexto('');
  };

  const eliminarNota = (id) => {
    setNotas(notas.filter(n => n.id !== id));
  };

  const colores = {
    rojo: 'bg-red-50 border-red-100 text-red-700',
    amarillo: 'bg-amber-50 border-amber-100 text-amber-700',
    verde: 'bg-green-50 border-green-100 text-green-700'
  };

  const puntos = {
    rojo: 'bg-red-500',
    amarillo: 'bg-amber-500',
    verde: 'bg-green-500'
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-pink-500" />
          <h4 className="text-slate-800 font-black uppercase text-[10px] tracking-widest">Faltantes</h4>
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg">{fechaHoy}</span>
      </div>

      <div className="space-y-4 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
        <textarea 
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribir falta..."
          className="w-full p-3 text-[11px] bg-white border border-slate-100 rounded-xl outline-none resize-none focus:ring-1 focus:ring-pink-300"
          rows="2"
        />
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-center gap-4 bg-white py-2 rounded-xl border border-slate-100">
            {['rojo', 'amarillo', 'verde'].map((col) => (
              <button
                key={col}
                onClick={() => setPrioridad(col)}
                className={`w-5 h-5 rounded-full transition-transform ${prioridad === col ? 'ring-2 ring-slate-800 scale-110' : 'opacity-40'} ${puntos[col]}`}
              />
            ))}
          </div>
          
          <button 
            onClick={agregarNota}
            className="w-full flex items-center justify-center gap-2 bg-pink-500 text-white py-3 rounded-xl text-[10px] font-black hover:bg-pink-600 transition-all shadow-sm"
          >
            <Plus size={14} /> AGREGAR NOTA
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {notas.length === 0 ? (
          <p className="text-center text-slate-300 text-[9px] py-4 font-bold uppercase tracking-widest italic">Sin pendientes</p>
        ) : (
          notas.map((nota) => (
            <div key={nota.id} className={`p-3 rounded-2xl border flex justify-between items-start gap-2 ${colores[nota.prioridad]}`}>
              <div className="flex gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${puntos[nota.prioridad]}`} />
                <div>
                  <p className="text-[11px] font-medium leading-tight">{nota.texto}</p>
                  <p className="text-[8px] opacity-50 mt-1 font-bold">{nota.fecha}</p>
                </div>
              </div>
              <button onClick={() => eliminarNota(nota.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotasInventario;