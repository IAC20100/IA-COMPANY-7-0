import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { 
  Users, FileText, Plus, Hammer, 
  DollarSign, TrendingUp, Package, Database, 
  Calendar as CalendarIcon, CloudSun, Image as ImageIcon,
  Settings, Moon, Sun, UserPlus, Sun as SunIcon,
  Columns, Clock
} from 'lucide-react';
import { demoClients, demoProducts, demoChecklistItems, demoTickets, demoQuotes, demoReceipts, demoCosts, demoAppointments } from '../demoData';
import { useState, useEffect, useMemo } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TileData {
  id: string;
  type: 'wide' | 'square';
  component: React.ReactNode;
}

function SortableTile({ id, children, className }: { id: string, children: React.ReactNode, className: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

function WeatherTile() {
  const [data, setData] = useState<{ temp: number; city: string; condition: string; high: number; low: number } | null>(null);

  useEffect(() => {
    async function fetchLiveWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-22.9064&longitude=-43.1822&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto');
        const json = await res.json();
        
        const getWeatherCondition = (code: number) => {
          if (code === 0) return 'Céu Limpo';
          if (code >= 1 && code <= 3) return 'Parcialmente Nublado';
          if (code >= 45 && code <= 48) return 'Nevoeiro';
          if (code >= 51 && code <= 55) return 'Chuvisco';
          if (code >= 61 && code <= 65) return 'Chuva';
          if (code >= 80 && code <= 82) return 'Pancadas de Chuva';
          if (code >= 95) return 'Tempestade';
          return 'Nublado';
        };

        setData({
          temp: Math.round(json.current.temperature_2m),
          city: 'Rio de Janeiro',
          condition: getWeatherCondition(json.current.weather_code),
          high: Math.round(json.daily.temperature_2m_max[0]),
          low: Math.round(json.daily.temperature_2m_min[0])
        });
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    }
    fetchLiveWeather();
  }, []);

  return (
    <Link to="/weather" className="w-full h-full bg-gradient-to-br from-[#0078d7] to-[#005a9e] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex items-center gap-6 h-full relative z-10">
        <div className="relative group-hover:scale-110 transition-transform duration-500">
          <SunIcon className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
          <CloudSun className="w-10 h-10 text-white absolute -bottom-1 -right-1 drop-shadow-lg" />
        </div>
        <div>
          <span className="text-5xl font-light drop-shadow-lg">{data ? `${data.temp}°` : '--°'}</span>
          <div className="mt-1">
            <p className="text-sm font-bold uppercase tracking-wider drop-shadow-md">{data?.city || 'Carregando...'}</p>
            <p className="text-xs opacity-80 drop-shadow-sm">{data?.condition || '...'}</p>
            {data && <p className="text-[10px] opacity-60">{data.high}° / {data.low}°</p>}
          </div>
        </div>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Clima</span>
    </Link>
  );
}

export default function Dashboard() {
  const { clients, tickets, products, receipts, costs, appointments, companyLogo, restoreData, theme, toggleTheme } = useStore();
  
  const openTickets = tickets.filter(t => t.status !== 'CONCLUIDO').length;
  const totalReceitas = receipts.reduce((acc, curr) => acc + curr.value, 0);
  const totalDespesas = costs.reduce((acc, curr) => acc + curr.value, 0);
  const saldo = totalReceitas - totalDespesas;
  const nextAppointment = useMemo(() => {
    const future = appointments
      .filter(a => new Date(a.start) > new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return future[0] || appointments[0];
  }, [appointments]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Permite clicar sem arrastar se o movimento for pequeno
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const initialTiles: TileData[] = [
    {
      id: 'tickets',
      type: 'wide',
      component: (
        <Link to="/tickets" className="w-full h-full bg-zinc-900 hover:bg-black transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-zinc-800 shadow-xl active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Hammer className="w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider drop-shadow-md text-white/70">Ordens de Serviço</span>
            <span className="text-5xl font-light drop-shadow-lg text-white">{openTickets}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'clients',
      type: 'square',
      component: (
        <Link to="/clients" className="w-full h-full bg-gradient-to-br from-[#da532c] to-[#b94322] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Users className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-md">Clientes</span>
            <span className="text-2xl font-light drop-shadow-lg">{clients.length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'products',
      type: 'square',
      component: (
        <Link to="/products" className="w-full h-full bg-gradient-to-br from-[#7e3878] to-[#632c5e] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Package className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-md">Produtos</span>
            <span className="text-2xl font-light drop-shadow-lg">{products.length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'receipts',
      type: 'square',
      component: (
        <Link to="/receipts" className="w-full h-full bg-gradient-to-br from-[#f0a30a] to-[#d38b00] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <FileText className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-md">Recibos</span>
            <span className="text-2xl font-light drop-shadow-lg">{receipts.length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'financial',
      type: 'wide',
      component: (
        <Link to="/financial" className="w-full h-full bg-gradient-to-br from-[#00a300] to-[#008000] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex flex-col justify-center items-center h-full relative z-10">
            <TrendingUp className="w-14 h-14 text-white mb-2 drop-shadow-lg group-hover:translate-y-[-4px] transition-transform duration-500" />
            <span className="text-3xl font-light drop-shadow-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Financeiro</span>
        </Link>
      )
    },
    {
      id: 'calendar',
      type: 'wide',
      component: (
        <Link to="/calendar" className="w-full h-full bg-zinc-100 hover:bg-zinc-200 transition-all p-4 flex flex-col justify-between aspect-[2/1] group relative overflow-hidden border border-zinc-200 shadow-sm active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-black/5 to-black/10 pointer-events-none" />
          <div className="flex items-start gap-4 h-full relative z-10">
            <div className="p-3 bg-white rounded-2xl border border-zinc-200 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <CalendarIcon className="w-10 h-10 text-zinc-900" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 tracking-[0.2em]">Próximo Compromisso</p>
              {nextAppointment ? (
                <div className="space-y-1">
                  <p className="font-black text-xl truncate text-zinc-900 leading-tight">{nextAppointment.title}</p>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <p className="text-sm font-medium">
                      {new Date(nextAppointment.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(nextAppointment.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm italic text-zinc-300 mt-2">Sem compromissos agendados</p>
              )}
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10 text-zinc-400">Agenda</span>
        </Link>
      )
    },
    {
      id: 'kanban',
      type: 'square',
      component: (
        <Link to="/kanban" className="w-full h-full bg-gradient-to-br from-[#60a917] to-[#4d8712] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Columns className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-md">Kanban</span>
            <span className="text-2xl font-light drop-shadow-lg">{tickets.length}</span>
          </div>
        </Link>
      )
    },
    {
      id: 'weather',
      type: 'wide',
      component: <WeatherTile />
    },
    {
      id: 'quick-actions',
      type: 'square',
      component: (
        <div className="w-full h-full aspect-square grid grid-cols-2 grid-rows-2 gap-1 perspective-1000">
          <Link to="/tickets/new" title="Nova OS" className="bg-gradient-to-br from-[#ee1111] to-[#cc0000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <Plus className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-90 transition-transform" />
          </Link>
          <Link to="/quotes" title="Novo Orçamento" className="bg-gradient-to-br from-[#ff0097] to-[#d4007d] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <FileText className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>
          <Link to="/clients" title="Novo Cliente" className="bg-gradient-to-br from-[#da532c] to-[#b94322] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <UserPlus className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>
          <Link to="/financial" title="Novo Gasto" className="bg-gradient-to-br from-[#00a300] to-[#008000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            <DollarSign className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      )
    },
    {
      id: 'settings',
      type: 'square',
      component: (
        <Link to="/settings" className="w-full h-full bg-gradient-to-br from-[#52525b] to-[#3f3f46] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Settings className="w-12 h-12 text-white drop-shadow-lg group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Ajustes</span>
        </Link>
      )
    },
    {
      id: 'demo-data',
      type: 'square',
      component: (
        <button onClick={() => handleLoadDemoData()} className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] hover:brightness-110 transition-all p-4 flex flex-col justify-between aspect-square group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-left">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="flex justify-center items-center h-full relative z-10">
            <Database className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Demo Data</span>
        </button>
      )
    }
  ];

  const [tiles, setTiles] = useState<TileData[]>(initialTiles);

  // Sincronizar dados dinâmicos nos tiles quando o store mudar
  useEffect(() => {
    setTiles(prev => prev.map(tile => {
      const fresh = initialTiles.find(t => t.id === tile.id);
      return fresh ? { ...tile, component: fresh.component } : tile;
    }));
  }, [clients.length, tickets.length, products.length, receipts.length, saldo, nextAppointment]);

  const handleLoadDemoData = () => {
    if (window.confirm('Isso irá substituir seus dados atuais por dados de demonstração. Deseja continuar?')) {
      restoreData({
        clients: demoClients,
        products: demoProducts,
        checklistItems: demoChecklistItems,
        tickets: demoTickets,
        quotes: demoQuotes,
        receipts: demoReceipts,
        costs: demoCosts,
        appointments: demoAppointments,
      });
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-8 md:p-12 bg-[#004a7c] text-white overflow-x-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="currentColor" className="text-white/5" fillOpacity="0.5" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="currentColor" className="text-white/10" fillOpacity="0.5" />
        </svg>
      </div>

      <header className="mb-12 flex justify-between items-start relative z-10">
        <h1 className="text-6xl font-light tracking-tight text-white">Iniciar</h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <div className="text-right">
            <p className="text-xl font-medium text-white">Administrador</p>
            <p className="text-sm text-white/60 font-medium">IA COMPANY TEC</p>
          </div>
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
          ) : (
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/60">
              <Users className="w-6 h-6" />
            </div>
          )}
        </div>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={tiles.map(t => t.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 relative z-10 max-w-[1400px] perspective-1000">
            {tiles.map((tile) => (
              <SortableTile 
                key={tile.id} 
                id={tile.id} 
                className={tile.type === 'wide' ? 'col-span-2' : 'col-span-1'}
              >
                {tile.component}
              </SortableTile>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
