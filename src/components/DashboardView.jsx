import React from 'react';
import { Package, Hash, Layers } from 'lucide-react';

const DashboardView = ({ reporte }) => {
  if (!reporte) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-4"></div>
      <p className="font-medium">Conectando con Neon...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stock Global */}
      <div className="card-container bg-gradient-to-br from-white to-slate-50 border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-tighter">Inventario Total</p>
            <h3 className="text-6xl font-black text-slate-800">{reporte.totalGeneral}</h3>
          </div>
          <div className="p-4 bg-white shadow-inner rounded-2xl">
            <Package size={40} className="text-pink-500" />
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(reporte.detallePorCategoria).map(([cat, info]) => (
          <div key={cat} className="card-container hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-pink-400" />
                  <h4 className="text-slate-800 font-black uppercase text-sm tracking-widest">{cat}</h4>
                </div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {info.totalCategoria} Unidades
                </span>
            </div>
            
            <div className="space-y-3">
              {Object.entries(info.productos).map(([p, q]) => (
                <div key={p} className="flex justify-between items-center group">
                  <span className="text-slate-500 text-sm group-hover:text-slate-800 transition-colors">{p}</span>
                  <div className="flex items-center gap-1">
                    <Hash size={12} className="text-slate-300" />
                    <span className="font-bold text-slate-700 text-sm">{q}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;