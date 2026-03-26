import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, runDb } from '../db';
import { GlassCard, NeonButton } from '../components/UI';
import { Activity, Droplets, Heart, Moon, Plus, ChevronLeft, TrendingUp, HeartPulse, ArrowUpRight } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const HealthTracker: React.FC = () => {
  const metrics = useLiveQuery(() => db.healthMetrics.toArray());
  const [selectedMetric, setSelectedMetric] = useState<'steps' | 'water' | 'heartRate'>('steps');
  const [showAddModal, setShowAddModal] = useState(false);

  const latestValue = (metrics || []).filter(m => m.type === selectedMetric).sort((a, b) => b.timestamp - a.timestamp)[0]?.value || 0;
  const chartData = (metrics || [])
    .filter(m => m.type === selectedMetric)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(m => ({
      date: format(m.timestamp, 'MMM d'),
      value: m.value
    }));

  return (
    <div className="pb-32 pt-8 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-accent transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold italic">Health Tracking</h1>
        </div>
        <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
          <button 
            onClick={() => window.location.href = '/appointment'}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold text-xs uppercase tracking-wider neon-glow hover:scale-105 transition-transform"
          >
            Book Appointment
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-accent shrink-0"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Metric Selector */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2">
            <MetricTab 
              active={selectedMetric === 'steps'} 
              onClick={() => setSelectedMetric('steps')}
              icon={Activity}
              label="Steps"
              color="text-accent"
            />
            <MetricTab 
              active={selectedMetric === 'water'} 
              onClick={() => setSelectedMetric('water')}
              icon={Droplets}
              label="Water"
              color="text-blue-400"
            />
            <MetricTab 
              active={selectedMetric === 'heartRate'} 
              onClick={() => setSelectedMetric('heartRate')}
              icon={Heart}
              label="Heart"
              color="text-red-400"
            />
          </div>

          {/* Main Chart Card */}
          <GlassCard className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Current {selectedMetric}</p>
                <h2 className="text-5xl md:text-6xl font-bold">{Math.round(latestValue)}<span className="text-lg text-white/40 ml-2">
                  {selectedMetric === 'steps' ? 'steps' : selectedMetric === 'water' ? 'L' : 'bpm'}
                </span></h2>
              </div>
              <div className="flex items-center gap-2 text-accent bg-accent/10 px-3 py-1 rounded-full">
                <TrendingUp size={14} />
                <span className="text-[10px] font-bold">+12%</span>
              </div>
            </div>

            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#adff2f" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#adff2f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#adff2f' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#adff2f" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <h3 className="text-lg font-bold">Wellness Insights</h3>
          <div className="space-y-4">
            <InsightCard 
              title="Hydration Goal" 
              desc="You're 80% through your daily water goal. Keep it up!" 
              progress={80}
            />
            <InsightCard 
              title="Step Count" 
              desc="Great job! You've exceeded your average steps this week." 
              progress={110}
            />
            <GlassCard className="p-6 bg-accent/5 border-accent/20">
              <h4 className="font-bold mb-2">Weekly Summary</h4>
              <p className="text-sm text-white/60">
                Your activity levels are up by 15% compared to last week. Your heart rate variability shows good recovery.
              </p>
            </GlassCard>

            <GlassCard 
              className="p-6 bg-accent/10 border-accent/30 cursor-pointer hover:bg-accent/20 transition-all group"
              onClick={() => window.location.href = '/checkup'}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-black">
                  <HeartPulse size={20} />
                </div>
                <ArrowUpRight size={20} className="text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
              <h4 className="font-bold mb-1">Fitness Checkup</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                Get a comprehensive health risk assessment based on your vitals.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddMetricModal 
            onClose={() => setShowAddModal(false)} 
            type={selectedMetric}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddMetricModal = ({ onClose, type }: { onClose: () => void, type: string }) => {
  const [value, setValue] = useState('');
  
  const handleAdd = async () => {
    if (!value) return;
    const unit = type === 'steps' ? 'steps' : type === 'water' ? 'L' : 'bpm';
    await runDb(() => db.healthMetrics.add({
      type: type as any,
      value: parseFloat(value),
      unit,
      timestamp: Date.now()
    }));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md glass-card p-8 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Add {type}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-white/40">Value ({type === 'steps' ? 'steps' : type === 'water' ? 'L' : 'bpm'})</label>
          <input 
            type="number" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50"
            placeholder={`Enter ${type}...`}
            autoFocus
          />
        </div>

        <NeonButton onClick={handleAdd} className="w-full h-14">
          Save Metric
        </NeonButton>
      </motion.div>
    </motion.div>
  );
};

const MetricTab = ({ active, onClick, icon: Icon, label, color }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-6 py-4 rounded-3xl transition-all duration-300 shrink-0",
      active ? "bg-white text-black font-bold scale-105" : "glass-card text-white/60"
    )}
  >
    <Icon size={20} className={active ? "text-black" : color} />
    <span>{label}</span>
  </button>
);

const InsightCard = ({ title, desc, progress }: any) => (
  <GlassCard className="p-4 space-y-3">
    <div className="flex justify-between items-center">
      <h4 className="font-bold text-sm">{title}</h4>
      <span className="text-accent text-xs font-bold">{progress}%</span>
    </div>
    <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        className="h-full bg-accent neon-glow"
      />
    </div>
  </GlassCard>
);
