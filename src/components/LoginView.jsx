import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, KeyRound } from 'lucide-react';
import api from '../services/api';

const LoginView = ({ onLoginSuccess, vistaPrevia, setVistaPrevia }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const res = await api.post('/api/auth/login', { username, password });
      
      // Guardamos los datos de sesión de forma persistente
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('rol', res.data.rol);
      localStorage.setItem('nombreLocal', res.data.nombreLocal);
      localStorage.setItem('username', res.data.username);

      // Desactivamos la vista previa si estaba activa y notificamos a App.jsx
      setVistaPrevia(false);
      onLoginSuccess(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  // SI ESTÁ EN MODO VISTA PREVIA: Encogemos el login a una viñeta flotante discreta
  if (vistaPrevia) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-fade-in transition-all">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Modo de Consulta</span>
          <span className="text-xs font-bold text-slate-700">Estás en Vista Previa</span>
        </div>
        <button
          onClick={() => setVistaPrevia(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black uppercase rounded-xl shadow-md shadow-pink-500/10 transition-all active:scale-95"
        >
          <EyeOff size={12} />
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // MODO NORMAL: Formulario centrado con fondo borroso absoluto
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
        
        {/* Decoración superior estética */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-400 to-rose-500" />

        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 mb-3 shadow-inner">
            <KeyRound size={22} />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">MERCADITO DULCINEA</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Control de Inventario Inter-Sucursales</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Usuario del Local</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-300" size={16} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: local1 o local2"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:border-pink-300 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña de Seguridad</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:border-pink-300 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {cargando ? 'Validando Acceso...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="border-t border-slate-100 mt-6 pt-5 flex flex-col items-center">
          <p className="text-[10px] text-slate-400 font-medium mb-2.5">¿Solo necesitas auditar existencias actuales?</p>
          <button
            onClick={() => setVistaPrevia(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-600 hover:text-pink-600 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <Eye size={14} />
            Activar Vista Previa
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginView;