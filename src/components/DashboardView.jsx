import React, { useState } from 'react';
import { Package, Hash, Layers, Trash2, ChevronDown, ChevronUp, Calendar, Scissors, Truck, Clock, Edit2 } from 'lucide-react';
import api from '../services/api';
import NotasInventario from './NotasInventario';

const DashboardView = ({ reporte, onEliminar, onTrozar }) => {
  const [expandidos, setExpandidos] = useState({});
  const [detalles, setDetalles] = useState({});
  const [cargandoDetalle, setCargandoDetalle] = useState({});

  // FUNCIÓN PARA CALCULAR LOS DÍAS TRANSCURRIDOS DESDE LA ELABORACIÓN
  const obtenerDiasTranscurridos = (fechaElab) => {
    if (!fechaElab) return { texto: "Sin fecha", dias: 0 };

    let anio, mes, dia;
    if (fechaElab.includes('-')) {
      [anio, mes, dia] = fechaElab.split('-');
    } else if (fechaElab.includes('/')) {
      [dia, mes, anio] = fechaElab.split('/');
    } else {
      return { texto: fechaElab, dias: 0 };
    }

    const fechaProd = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
    const fechaHoy = new Date();

    fechaProd.setHours(0, 0, 0, 0);
    fechaHoy.setHours(0, 0, 0, 0);

    const diferenciaMilisegundos = fechaHoy - fechaProd;
    const dias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

    if (dias < 0) return { texto: "Fecha Futura", dias: 0 };
    if (dias === 0) return { texto: "Elaborado Hoy", dias: 0 };
    if (dias === 1) return { texto: "Lleva 1 Día", dias: 1 };
    return { texto: `Lleva ${dias} Días`, dias };
  };

  // NUEVA FUNCIÓN INTERNA PARA MODIFICAR EL NÚMERO DE TROZOS EXACTO
  const ajustarCantidadTrozos = async (item, nombreProducto) => {
    const nuevoStockStr = window.prompt(`¿Cuántas porciones quedan actualmente de este lote? (Stock actual: ${item.stockTrozos}):`);
    
    if (nuevoStockStr === null) return; // Si cancela, no hace nada

    const nuevoStock = parseInt(nuevoStockStr);
    if (isNaN(nuevoStock) || nuevoStock < 0) {
      alert("Por favor, ingresa una cantidad válida (0 o superior).");
      return;
    }

    try {
      // Reutilizamos tu endpoint @PutMapping("/{id}") enviando el objeto con el stock actualizado
      const productoActualizado = {
        ...item,
        stockTrozos: nuevoStock
      };

      await api.put(`/productos/${item.id}`, productoActualizado);

      // Actualizamos el estado de "detalles" localmente para que cambie en pantalla al segundo
      setDetalles(prev => {
        const lotesActuales = prev[nombreProducto] || [];
        const lotesModificados = lotesActuales.map(lote => 
          lote.id === item.id ? { ...lote, stockTrozos: nuevoStock } : lote
        );
        return { ...prev, [nombreProducto]: lotesModificados };
      });

      alert("¡Cantidad de trozos actualizada con éxito!");
    } catch (err) {
      console.error("Error al actualizar trozos:", err);
      alert("No se pudo actualizar la cantidad en el servidor.");
    }
  };

  const toggleExpandir = async (nombreProducto) => {
    const estaAbierto = !!expandidos[nombreProducto];
    setExpandidos(prev => ({ ...prev, [nombreProducto]: !estaAbierto }));

    if (!estaAbierto && !detalles[nombreProducto]) {
      setCargandoDetalle(prev => ({ ...prev, [nombreProducto]: true }));
      try {
        const nombreLimpio = nombreProducto.includes(' (') ? nombreProducto.split(' (')[0] : nombreProducto;
        const res = await api.get(`/productos/buscar?nombre=${nombreLimpio}`);
        setDetalles(prev => ({ ...prev, [nombreProducto]: res.data }));
      } catch (err) {
        console.error("Error al obtener detalles:", err);
      } finally {
        setCargandoDetalle(prev => ({ ...prev, [nombreProducto]: false }));
      }
    }
  };

  if (!reporte) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-4"></div>
      <p className="font-medium">Conectando con Neon...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stock Global */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-8 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Inventario Total</p>
            <h3 className="text-7xl font-black text-slate-800 tracking-tighter">{reporte.totalGeneral}</h3>
          </div>
          <div className="p-5 bg-white shadow-sm rounded-3xl border border-slate-100">
            <Package size={48} className="text-pink-500" />
          </div>
        </div>
      </div>

      {/* REJILLA CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        
        {Object.entries(reporte.detallePorCategoria).map(([cat, info]) => (
          <div key={cat} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-fit">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Layers size={18} className="text-pink-400" />
                </div>
                <h4 className="text-slate-800 font-black uppercase text-xs tracking-widest">{cat}</h4>
              </div>
              <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                {info.totalCategoria} Un
              </span>
            </div>
            
            <div className="space-y-4">
              {Object.entries(info.productos).map(([nombreProducto, cantidad]) => (
                <div key={nombreProducto} className="flex flex-col border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white hover:border-pink-100 transition-colors">
                  <div 
                    onClick={() => toggleExpandir(nombreProducto)}
                    className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${expandidos[nombreProducto] ? 'bg-pink-50/40' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {expandidos[nombreProducto] ? <ChevronUp size={16} className="text-pink-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                      <span className="text-slate-700 text-sm font-bold truncate">{nombreProducto}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
                      <Hash size={12} className="text-slate-300" />
                      <span className="font-bold text-slate-800 text-xs">{cantidad}</span>
                    </div>
                  </div>

                  {expandidos[nombreProducto] && (
                    <div className="p-3 bg-slate-50/50 border-t border-slate-100 space-y-3">
                      {cargandoDetalle[nombreProducto] ? (
                        <p className="text-[10px] text-center text-slate-400 uppercase font-black animate-pulse py-4">Cargando lotes...</p>
                      ) : (
                        detalles[nombreProducto]?.map((item) => {
                          const infoTiempo = obtenerDiasTranscurridos(item.fechaElaboracion);
                          
                          let colorAlerta = "bg-slate-50 text-slate-500 border-slate-200";
                          if (infoTiempo.dias >= 4) {
                            colorAlerta = "bg-red-50 text-red-700 border-red-200 animate-pulse font-extrabold";
                          } else if (infoTiempo.dias >= 2) {
                            colorAlerta = "bg-amber-50 text-amber-800 border-amber-200";
                          }

                          return (
                            <div key={item.id} className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase">
                                    <Calendar size={14} className="text-pink-400 flex-shrink-0" />
                                    <span className="text-slate-400 w-8">Elab:</span> 
                                    <span className="text-slate-800">{item.fechaElaboracion}</span>
                                  </div>
                                  
                                  <div className={`flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-md border uppercase tracking-wider ${colorAlerta}`}>
                                    <Clock size={10} />
                                    {infoTiempo.texto}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase">
                                  <Truck size={14} className="text-blue-400 flex-shrink-0" />
                                  <span className="text-slate-400 w-8">Lleg:</span> 
                                  <span className="text-slate-800">{item.fechaLlegada}</span>
                                </div>

                                {/* CONTADOR DE PORCIONES + BOTÓN PARA EDITAR NUMERO EXACTO */}
                                {item.esEntero?.toLowerCase() === 'no' && (
                                  <div className="mt-2 flex items-center justify-between bg-pink-50/60 border border-pink-100 px-3 py-2 rounded-xl shadow-inner">
                                    <div className="text-[10px] font-black text-pink-600 uppercase flex items-center gap-1.5">
                                      <span>Porciones Quedan:</span>
                                      <span className="text-xs bg-white text-slate-800 px-2 py-0.5 rounded-md border border-pink-200 font-mono shadow-sm font-bold">
                                        {item.stockTrozos}
                                      </span>
                                    </div>
                                    
                                    {/* BOTÓN CON CORRECCIÓN PARA ASIGNAR UN NÚMERO DIRECTO */}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); ajustarCantidadTrozos(item, nombreProducto); }}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
                                      title="Cambiar stock de porciones"
                                    >
                                      <Edit2 size={10} />
                                      Modificar
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                                <span className="text-[9px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded">ID: {item.id}</span>
                                <div className="flex gap-2 items-center">
                                  
                                  {/* BOTÓN TROZAR ORIGINAL */}
                                  {!cat.toLowerCase().includes('sandwich') && item.esEntero?.toLowerCase() === 'si' && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onTrozar(item.id); }} 
                                      className="p-2 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors flex items-center gap-1 shadow-sm font-bold"
                                      title="Trozar Producto"
                                    >
                                      <Scissors size={14} />
                                      <span className="text-[9px] font-black uppercase tracking-wider">Trozar</span>
                                    </button>
                                  )}
                                  
                                  <button onClick={(e) => { e.stopPropagation(); onEliminar(nombreProducto, cat, item.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* COLUMNA DE NOTAS */}
        <div className="w-full">
          <NotasInventario />
        </div>

      </div>
    </div>
  );
};

export default DashboardView;