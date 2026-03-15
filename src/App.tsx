import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Moon, Sun, User, LogOut, Database } from 'lucide-react';
import { useStore } from './store';
import { supabase } from './lib/supabase';

import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ChecklistManager from './pages/ChecklistManager';
import Tickets from './pages/Tickets';
import TicketForm from './pages/TicketForm';
import TicketView from './pages/TicketView';
import Settings from './pages/Settings';
import KanbanBoard from './pages/KanbanBoard';
import Quotes from './pages/Quotes';
import Receipts from './pages/Receipts';
import Financial from './pages/Financial';
import Calendar from './pages/Calendar';
import Products from './pages/Products';
import Login from './pages/Login';
import Weather from './pages/Weather';

function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('company_settings').select('id').limit(1);
        if (error) {
          console.error('Supabase connection error:', error);
          setStatus('error');
        } else {
          setStatus('connected');
        }
      } catch (err) {
        setStatus('error');
      }
    }
    checkConnection();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium shadow-lg border border-white/10">
      <Database className="w-3 h-3" />
      {status === 'checking' && <span className="text-yellow-400">Verificando Supabase...</span>}
      {status === 'connected' && <span className="text-green-400">Supabase Conectado</span>}
      {status === 'error' && <span className="text-red-400">Erro no Supabase (Verifique as chaves)</span>}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, isAuthenticated, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }

  const isDashboard = location.pathname === '/';
  const isImmersive = isDashboard || [
    '/tickets', 
    '/service-orders', 
    '/tickets/new', 
    '/calendar', 
    '/kanban', 
    '/products', 
    '/financial', 
    '/receipts', 
    '/settings',
    '/clients'
  ].some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors duration-200 font-sans flex flex-col">
      {/* Modern Top Bar */}
      {!isImmersive && (
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="text-xl font-bold hover:text-red-600 transition-colors">
              Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block mr-4">
              <div className="text-sm font-medium">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="Alternar Tema">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="Sair">
                <LogOut className="w-5 h-5" />
              </button>
              <Link to="/settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" title="Configurações">
                <SettingsIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 relative z-10 ${isDashboard ? '' : 'p-6 md:p-8'}`}>
        {children}
      </main>
      <SupabaseStatus />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/products" element={<Products />} />
          <Route path="/checklist" element={<ChecklistManager />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/service-orders" element={<Tickets />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/tickets/new" element={<TicketForm />} />
          <Route path="/tickets/:id/edit" element={<TicketForm />} />
          <Route path="/tickets/:id" element={<TicketView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/weather" element={<Weather />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
