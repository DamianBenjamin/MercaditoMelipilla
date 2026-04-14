import React from 'react';
import { PlusCircle, Send, Calendar } from 'lucide-react';

const FormularioIngreso = ({ form, setForm, onSubmit, mensaje, cargando }) => {
  return (
    <div className="card-container shadow-xl border-pink-100 sticky top-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-pink-100 rounded-lg">
          <PlusCircle className="text-pink-500" size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Registrar Producto</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Categoría y Nombre */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Categoría</label>
            <select 
              value={form.categoria}
              onChange={(e) => setForm({...form, categoria: e.target.value})}
              className="input-field text-sm"
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
              className="input-field text-sm"
            >
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nombre</label>
          <input 
            type="text"
            className="input-field"
            placeholder="Ej: Cheesecake Frambuesa"
            value={form.nombre}
            onChange={(e) => setForm({...form, nombre: e.target.value})}
            required
          />
        </div>

        {/* Entero / Trozado y Stock Trozos */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Formato</label>
            <select 
              value={form.esEntero}
              onChange={(e) => setForm({...form, esEntero: e.target.value})}
              className="w-full bg-transparent font-bold text-sm outline-none"
            >
              <option value="Si">Entero</option>
              <option value="No">Trozado</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cant. Trozos</label>
            <input 
              type="number" 
              className="w-full bg-transparent font-bold text-sm outline-none"
              value={form.stockTrozos}
              onChange={(e) => setForm({...form, stockTrozos: parseInt(e.target.value)})}
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={10}/> Elaboración
            </label>
            <input 
              type="date" 
              className="input-field text-xs" 
              value={form.fechaElaboracion}
              onChange={(e) => setForm({...form, fechaElaboracion: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Calendar size={10}/> Llegada
            </label>
            <input 
              type="date" 
              className="input-field text-xs" 
              value={form.fechaLlegada}
              onChange={(e) => setForm({...form, fechaLlegada: e.target.value})}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={cargando} className="btn-primary mt-2">
          {cargando ? "Registrando..." : <><Send size={18} /> Guardar en Inventario</>}
        </button>
      </form>

      {mensaje && (
        <div className={`mt-4 p-3 rounded-xl text-xs text-center font-bold ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default FormularioIngreso;