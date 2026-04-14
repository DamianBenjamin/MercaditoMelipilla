import React, { useEffect, useState } from 'react';
import api from './services/api';

function App() {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReporte = async () => {
      try {
        const res = await api.get('/productos/reporte/jerarquico-completo');
        setReporte(res.data);
      } catch (err) {
        setError("¿Encendiste el Backend en IntelliJ?");
        console.error(err);
      }
    };
    fetchReporte();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          MERCADITO <span className="text-pink-500">DULCINEA</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Panel de Control de Inventario</p>
      </header>

      <main className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {reporte ? (
          <div className="grid gap-6">
            {/* Tarjeta de Total General */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-700">Stock Total en Sistema</h2>
              <span className="text-4xl font-black text-pink-500">{reporte.totalGeneral}</span>
            </div>

            {/* Listado por Categorías */}
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(reporte.detallePorCategoria).map(([nombreCat, detalle]) => (
                <div key={nombreCat} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">{nombreCat}</h3>
                    <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold">
                      {detalle.totalCategoria} unidades
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {Object.entries(detalle.productos).map(([prod, cant]) => (
                      <li key={prod} className="flex justify-between text-slate-600 italic">
                        <span>{prod}</span>
                        <span className="font-semibold text-slate-800">{cant}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 animate-pulse">Cargando datos del Mercadito...</p>
        )}
      </main>
    </div>
  );
}

export default App;