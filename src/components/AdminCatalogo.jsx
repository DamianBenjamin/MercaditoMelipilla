import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Search } from 'lucide-react';
import api from '../services/api';

const AdminCatalogo = ({ onCatalogoCambiado }) => {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Sandwich');
  const [cargando, setCargando] = useState(false);

  const cargarCatalogo = async () => {
    try {
      const termino = busqueda.trim() ? busqueda : "";
      const res = await api.get(`/api/catalogo/buscar?termino=${termino}`);
      setItems(res.data);
    } catch (err) {
      console.error("Error al cargar catálogo maestro:", err);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, [busqueda]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    if (cargando) return;
    setCargando(true);

    try {
      await api.post('/api/catalogo/registrar', {
        nombre: nuevoNombre.trim(),
        categoriaDefecto: nuevaCategoria
      });
      alert(`¡"${nuevoNombre}" agregado al catálogo maestro!`);
      setNuevoNombre('');
      cargarCatalogo();
      if (onCatalogoCambiado) onCatalogoCambiado();
    } catch (err) {
      console.error(err);
      alert("Error: El producto ya existe o hubo un problema de red.");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${nombre}" de la Lista Maestra?\nYa no aparecerá como opción en el formulario.`)) return;

    try {
      await api.delete(`/api/catalogo/eliminar/${id}`);
      cargarCatalogo();
      if (onCatalogoCambiado) onCatalogoCambiado();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el producto del catálogo maestro.");
    }
  };

  return (
    <div className="w-full bg-white border border-[#3D2517]/20 p-6 rounded-[2rem] shadow-xl shadow-[#3D2517]/5 mt-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        {/* 🎨 COLOR CEREZA: Icono con la guinda del logo */}
        <div className="p-2 bg-[#D91A3D] rounded-xl text-white shadow-sm shadow-[#D91A3D]/20">
          <Shield size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#3D2517] uppercase tracking-wider">Catálogo Maestro</h3>
          <p className="text-[10px] text-slate-400 font-medium">Gestión de los nombres de los productos en el sistema</p>
        </div>
      </div>

      <form onSubmit={handleAgregar} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3 mb-4">
        <div className="text-[10px] font-black text-[#3D2517]/70 uppercase tracking-wider mb-1">Nuevo Producto Oficial</div>
        <input
          type="text"
          placeholder="Ej: Torta Pompadour Grande"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D2517]/50"
          required
        />
        <div className="grid grid-cols-2 gap-2 items-center">
          <select
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-[#3D2517]/50"
          >
            <option value="Sandwich">🥪 Sándwich</option>
            <option value="Pastelería">🍰 Pastelería</option>
          </select>
          {/* 🎨 BOTÓN CEREZA: Unificado con el formulario superior */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2 bg-[#D91A3D] hover:bg-[#b81431] text-white text-[11px] font-black uppercase rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus size={12} /> {cargando ? 'Guardando...' : 'Añadir'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en el catálogo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none placeholder-slate-400 focus:border-[#3D2517]/50 focus:bg-white transition-colors"
          />
        </div>

        <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="p-2.5 flex justify-between items-center bg-white hover:bg-[#FDF6F0] transition-colors">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-700 truncate">{item.nombre}</span>
                  <span className="text-[8px] font-black uppercase text-[#3D2517]/60 tracking-wider mt-0.5">{item.categoriaDefecto}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminar(item.id, item.nombre)}
                  className="p-1.5 text-slate-300 hover:text-[#D91A3D] hover:bg-[#FCEAEB] rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-center text-slate-300 font-bold py-4 uppercase">Catálogo vacío o sin coincidencias</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCatalogo;