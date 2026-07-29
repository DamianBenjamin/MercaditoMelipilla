import React, { useState, useEffect } from 'react';
import { Package, Hash, Layers, Trash2, ChevronDown, ChevronUp, Calendar, Scissors, Truck, Clock, Edit2, Inbox, FileText, Table, AlertTriangle, Bell, PieChart, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import NotasInventario from './NotasInventario';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const DashboardView = ({ reporte, onEliminar, onTrozar, actualizarLotesKey, esSoloLectura }) => {
  const [expandidos, setExpandidos] = useState({});
  const [detalles, setDetalles] = useState({});
  const [cargandoDetalle, setCargandoDetalle] = useState({});

  // 🚀 Cargar los detalles de todos los productos automáticamente para saber Enteros vs Trozados ANTES de abrir
  useEffect(() => {
    setDetalles({});
    setExpandidos({});
    
    if (reporte && reporte.detallePorCategoria) {
      Object.values(reporte.detallePorCategoria).forEach(info => {
        if (info.productos) {
          Object.keys(info.productos).forEach(nombreProducto => {
            cargarDetalleProducto(nombreProducto);
          });
        }
      });
    }
  }, [actualizarLotesKey, reporte]);

  const cargarDetalleProducto = async (nombreProducto) => {
    try {
      const nombreLimpio = nombreProducto.includes(' (') ? nombreProducto.split(' (')[0] : nombreProducto;
      const res = await api.get(`api/productos/buscar?nombre=${nombreLimpio}`);
      setDetalles(prev => ({ ...prev, [nombreProducto]: res.data }));
    } catch (err) {
      console.error("Error al precargar lotes de", nombreProducto, err);
    }
  };

  const categoriesFijas = ['Sandwich', 'Pastelería'];

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

  const exportarExcel = () => {
    if (!reporte || !reporte.detallePorCategoria) return;
    const filas = [];
    Object.entries(reporte.detallePorCategoria).forEach(([categoria, info]) => {
      Object.entries(info.productos || {}).forEach(([nombreProducto, quantity]) => {
        filas.push({ 'Categoría': categoria, 'Producto / Detalle': nombreProducto, 'Cantidad Total (Unidades)': quantity });
      });
    });
    if (filas.length === 0) { alert("No hay datos disponibles para exportar."); return; }
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Inventario Diario');
    const fechaHoy = new Date().toISOString().split('T')[0];
    XLSX.writeFile(libro, `inventario_mercadito_${fechaHoy}.xlsx`);
  };

  const exportarPDF = () => {
    if (!reporte || !reporte.detallePorCategoria) return;
    try {
      const doc = new jsPDF();
      const fechaHoy = new Date().toISOString().split('T')[0];
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.text("MERCADITO DULCINEA", 14, 20);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(`Reporte Diario de Inventario - Fecha: ${fechaHoy}`, 14, 28);
      doc.text(`Stock Total General en Sistema: ${reporte.totalGeneral} unidades`, 14, 34);
      const columnas = ["Categoría", "Producto / Detalle", "Cantidad"];
      const filas = [];
      Object.entries(reporte.detallePorCategoria).forEach(([categoria, info]) => {
        Object.entries(info.productos || {}).forEach(([nombreProducto, quantity]) => {
          filas.push([categoria, nombreProducto, `${quantity} Un`]);
        });
      });
      if (filas.length > 0) {
        autoTable(doc, { startY: 40, head: [columnas], body: filas, theme: 'striped', headStyles: { fillColor: [61, 37, 23] }, styles: { font: "helvetica", fontSize: 10 } });
      } else { doc.text("No hay productos registrados en el inventario actual.", 14, 50); }
      doc.save(`reporte_inventario_${fechaHoy}.pdf`);
    } catch (error) { console.error("Error al generar el PDF:", error); }
  };

  const ajustarCantidadTrozos = async (item, nombreProducto) => {
    const nuevoStockStr = window.prompt(`¿Cuántas porciones quedan actualmente de este lote? (Stock actual: ${item.stockTrozos}):`);
    if (nuevoStockStr === null) return;
    const nuevoStock = parseInt(nuevoStockStr);
    if (isNaN(nuevoStock) || nuevoStock < 0) { alert("Por favor, ingresa una cantidad válida (0 o superior)."); return; }
    try {
      await api.put(`api/productos/${item.id}`, { ...item, stockTrozos: nuevoStock });
      setDetalles(prev => {
        const lotesModificados = (prev[nombreProducto] || []).map(lote => lote.id === item.id ? { ...lote, stockTrozos: nuevoStock } : lote);
        return { ...prev, [nombreProducto]: lotesModificados };
      });
      alert("¡Cantidad de trozos actualizada con éxito!");
    } catch (err) { console.error(err); }
  };

  const toggleExpandir = (nombreProducto) => {
    setExpandidos(prev => ({ ...prev, [nombreProducto]: !prev[nombreProducto] }));
    if (!detalles[nombreProducto]) {
      cargarDetalleProducto(nombreProducto);
    }
  };

  if (!reporte) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D2517] mb-4"></div>
      <p className="font-bold text-[#3D2517]/60 text-xs uppercase tracking-wider">Conectando con Neon...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ALERTA DE REPOSICIÓN */}
      {reporte.alertasStock && reporte.alertasStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-amber-800 font-sans font-black uppercase text-xs tracking-widest">Alertas de Reposición Urgentes</h4>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reporte.alertasStock.map((alerta, index) => (
              <div key={index} className={`flex items-center justify-between p-3.5 rounded-xl border bg-white shadow-sm ${alerta.estado === 'CRÍTICO' ? 'border-red-200 bg-red-50/10' : 'border-amber-100'}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <AlertTriangle size={16} className={alerta.estado === 'CRÍTICO' ? 'text-red-500' : 'text-amber-500'} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-700 break-words">{alerta.productoNombre}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{alerta.categoria}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mono shadow-inner border flex-shrink-0 ml-2 ${
                  alerta.estado === 'CRÍTICO' ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {alerta.cantidadActual} {alerta.cantidadActual === 1 ? 'Unidad' : 'Unidades'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOTAL GLOBAL RE-ESTILIZADO */}
      <div className="bg-white border border-[#3D2517]/20 p-8 rounded-[2rem] shadow-xl shadow-[#3D2517]/5 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-xl font-bold text-[#3D2517]">Inventario Total</p>
            <h3 className="text-7xl font-sans font-black text-[#3D2517] tracking-tighter">{reporte.totalGeneral}</h3>
          </div>
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            <button 
              onClick={exportarPDF} 
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3D2517] hover:bg-black text-white rounded-xl text-xs font-sans font-black uppercase tracking-wider cursor-pointer shadow-md shadow-[#3D2517]/10 transition-all active:scale-95"
            >
              <FileText size={16} /> Exportar PDF
            </button>
            
            <button 
              onClick={exportarExcel} 
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D91A3D] hover:bg-[#b81431] text-white rounded-xl text-xs font-sans font-black uppercase tracking-wider cursor-pointer shadow-md shadow-[#D91A3D]/10 transition-all active:scale-95"
            >
              <Table size={16} /> Exportar Excel
            </button>
            
            <div className="hidden sm:block p-4 bg-[#D91A3D]/5 shadow-inner rounded-2xl border border-[#D91A3D]/10 text-[#D91A3D]">
              <Package size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* REJILLA CATEGORÍAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {categoriesFijas.map((cat) => {
          const llaveBackend = Object.keys(reporte.detallePorCategoria || {}).find(k => k.toLowerCase().trim() === cat.toLowerCase().trim());
          const info = llaveBackend ? reporte.detallePorCategoria[llaveBackend] : null;
          const tieneProductos = info && info.productos && Object.keys(info.productos).length > 0;
          const totalCategoria = info ? info.totalCategoria : 0;

          return (
            <div key={cat} className="bg-white p-7 rounded-[2rem] border border-[#3D2517]/20 shadow-xl shadow-[#3D2517]/5 flex flex-col h-fit">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#D91A3D]/10 rounded-xl text-[#D91A3D]">
                    <Layers size={18} />
                  </div>
                  <h4 className="text-[#3D2517] font-sans font-black uppercase text-xs tracking-wider">
                    {cat === 'Sandwich' ? '🥪 Sándwiches' : '🍰 Pastelería'}
                  </h4>
                </div>
                <span className="bg-slate-100 text-[#3D2517] px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                  {totalCategoria} Un
                </span>
              </div>
              
              <div className="space-y-4">
                {tieneProductos ? (
                  Object.entries(info.productos).map(([nombreProducto, cantidadReporte]) => {
                    const lotesCargados = detalles[nombreProducto] || [];
                    
                    // Filtrar por tamaño si el nombre indica (Grande) o (Mediano)
                    const lotesFiltrados = lotesCargados.filter((item) => {
                      const esAcordeonGrande = nombreProducto.toLowerCase().includes('(grande)');
                      const esAcordeonMediano = nombreProducto.toLowerCase().includes('(mediano)');
                      const tamanoItem = item.tamano?.toLowerCase() || '';
                      if (esAcordeonGrande) return tamanoItem === 'grande';
                      if (esAcordeonMediano) return tamanoItem === 'mediano';
                      return true;
                    });

                    // 🎯 CONTEO EXACTO FÍSICO DE ENTEROS VS TROZADOS
                    const enterosCount = lotesFiltrados.filter(i => i.esEntero?.toLowerCase() === 'si').length;
                    const trozadosCount = lotesFiltrados.filter(i => i.esEntero?.toLowerCase() === 'no').length;
                    const totalLotesFisicos = lotesFiltrados.length;

                    return (
                      <div key={nombreProducto} className="flex flex-col border border-slate-200 rounded-[1.5rem] overflow-hidden bg-white hover:border-[#3D2517]/40 transition-colors">
                        
                        {/* 🌟 CABECERA ACORDEÓN (MUESTRA LAS CANTIDADES DE ENTEROS Y TROZADOS ANTES DE ABRIR) */}
                        <div onClick={() => toggleExpandir(nombreProducto)} className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${expandidos[nombreProducto] ? 'bg-[#FDF6F0]' : 'hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3 pr-2 flex-grow min-w-0">
                            {expandidos[nombreProducto] ? <ChevronUp size={16} className="text-[#D91A3D] flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                            {/* Nombre Completo sin recortar */}
                            <span className="text-slate-800 text-sm font-bold leading-tight break-words">{nombreProducto}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* 🟢/🟡 INDICADORES VISIBLES DE ENTEROS Y TROZADOS ANTES DE ABRIR */}
                            {lotesFiltrados.length > 0 ? (
                              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase">
                                {enterosCount > 0 && (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1" title="Piezas Enteras">
                                    🟢 {enterosCount} {enterosCount === 1 ? 'Entero' : 'Enteros'}
                                  </span>
                                )}
                                {trozadosCount > 0 && (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1" title="Piezas Trozadas">
                                    ✂️ {trozadosCount} {trozadosCount === 1 ? 'Trozado' : 'Trozados'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                <Hash size={12} className="text-slate-300" />
                                <span className="font-bold text-[#3D2517] text-xs">{cantidadReporte}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* DESPLEGABLE DE LOTES DETALLADOS */}
                        {expandidos[nombreProducto] && (
                          <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-3">
                            {lotesFiltrados.length === 0 ? (
                              <p className="text-[10px] text-center text-slate-400 uppercase font-black animate-pulse py-4">Cargando datos del lote...</p>
                            ) : (
                              lotesFiltrados.map((item) => {
                                const infoTiempo = obtenerDiasTranscurridos(item.fechaElaboracion);
                                let colorAlerta = "bg-slate-50 text-slate-500 border-slate-200";
                                if (infoTiempo.dias >= 4) { colorAlerta = "bg-red-50 text-red-700 border-red-200 animate-pulse font-extrabold"; }
                                else if (infoTiempo.dias >= 2) { colorAlerta = "bg-amber-50 text-amber-800 border-amber-200"; }

                                const esTrozado = item.esEntero?.toLowerCase() === 'no';

                                return (
                                  <div key={item.id} className={`flex flex-col gap-3 p-4 rounded-2xl border shadow-sm transition-all ${
                                    esTrozado ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200'
                                  }`}>
                                    {/* Estado del Lote (Pieza Entera vs Trozado) */}
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                      <div className="flex items-center gap-1.5">
                                        {esTrozado ? (
                                          <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                                            <Scissors size={10} /> Trozado ({item.stockTrozos} porciones disponibles)
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                                            <CheckCircle2 size={10} /> Pieza Entera
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-100">ID: {item.id}</span>
                                    </div>

                                    {/* FECHAS DE ELABORACIÓN Y LLEGADA */}
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase">
                                          <Calendar size={14} className="text-[#D91A3D]/70 flex-shrink-0" />
                                          <span className="text-slate-400 w-8">Elab:</span> <span className="text-slate-800">{item.fechaElaboracion}</span>
                                        </div>
                                        <div className={`flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-md border uppercase tracking-wider ${colorAlerta}`}>
                                          <Clock size={10} /> {infoTiempo.texto}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase">
                                        <Truck size={14} className="text-blue-400 flex-shrink-0" />
                                        <span className="text-slate-400 w-8">Lleg:</span> <span className="text-slate-800">{item.fechaLlegada}</span>
                                      </div>

                                      {/* MODIFICAR TROZOS */}
                                      {esTrozado && (
                                        <div className="mt-2 flex items-center justify-between bg-white border border-amber-200 px-3 py-2 rounded-xl shadow-xs">
                                          <div className="text-[10px] font-black text-[#3D2517] uppercase flex items-center gap-1.5">
                                            <PieChart size={12} className="text-amber-600" />
                                            <span>Porciones Quedan:</span> 
                                            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-mono font-bold">{item.stockTrozos}</span>
                                          </div>
                                          {!esSoloLectura && (
                                            <button onClick={(e) => { e.stopPropagation(); ajustarCantidadTrozos(item, nombreProducto); }} className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-[#3D2517] border border-slate-200 rounded-lg text-[9px] font-black uppercase shadow-sm transition-all cursor-pointer">
                                              <Edit2 size={10} /> Modificar
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* BOTONES DE ACCIÓN */}
                                    <div className="flex items-center justify-end border-t border-slate-100 pt-2.5 mt-1">
                                      <div className="flex gap-2 items-center">
                                        {!esSoloLectura && !cat.toLowerCase().includes('sandwich') && !esTrozado && (
                                          <button onClick={async (e) => { e.stopPropagation(); await onTrozar(item.id); }} className="p-2 bg-white hover:bg-[#FDF6F0] text-[#3D2517] border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
                                            <Scissors size={14} className="text-[#D91A3D]" /> <span className="text-[9px] font-black uppercase">Trozar Pieza</span>
                                          </button>
                                        )}
                                        {!esSoloLectura && (
                                          <button onClick={async (e) => { e.stopPropagation(); await onEliminar(nombreProducto, cat, item.id); }} className="p-2 text-slate-300 hover:text-[#D91A3D] hover:bg-[#FCEAEB] rounded-xl transition-colors cursor-pointer" title="Eliminar Lote">
                                            <Trash2 size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400">
                    <Inbox size={24} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold uppercase">Sin productos</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div className="w-full">
          <NotasInventario />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;