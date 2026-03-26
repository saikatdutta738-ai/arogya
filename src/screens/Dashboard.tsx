import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { GlassCard, NeonButton } from '../components/UI';
import { Bell, Search, Activity, Droplets, Heart, Moon, ArrowUpRight, Settings2, X, Eye, EyeOff, HeartPulse } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard: React.FC = () => {
  const user = useLiveQuery(() => db.userProfile.toCollection().first());
  const metrics = useLiveQuery(() => db.healthMetrics.orderBy('timestamp').reverse().limit(20).toArray());
  const appointments = useLiveQuery(() => db.appointments.where('status').equals('upcoming').limit(1).toArray());
  const doctors = useLiveQuery(() => db.doctors.toArray());
  const medicalRecordsCount = useLiveQuery(() => db.medicalRecords.count());
  const virtualAppointmentsCount = useLiveQuery(() => db.appointments.where('type').equals('virtual').count());

  const [showCustomize, setShowCustomize] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    stats: true,
    appointment: true,
    vitals: true,
    calendar: true
  });

  const latestSteps = metrics?.find(m => m.type === 'steps')?.value || 0;
  const latestWater = metrics?.find(m => m.type === 'water')?.value || 0;
  const latestHeart = metrics?.find(m => m.type === 'heartRate')?.value || 0;
  const latestSleep = metrics?.find(m => m.type === 'sleep')?.value || 0;
  const latestCalories = metrics?.find(m => m.type === 'calories')?.value || 0;

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 2);
    return d;
  });

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="pb-32 pt-8 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-accent p-0.5 overflow-hidden md:hidden">
              <img src={user?.avatar || undefined} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <p className="text-white/50 text-xs">Hi, {user?.name?.split(' ')[0] || 'User'}</p>
              <h2 className="text-xl md:text-2xl font-bold">Get Ready</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => window.location.href = '/checkup'}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-accent"
            >
              <HeartPulse size={24} />
            </button>
            <button 
              onClick={() => setShowCustomize(true)}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70"
            >
              <Settings2 size={24} />
            </button>
            <button className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70">
              <Bell size={24} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden md:flex items-center gap-2 glass-card px-4 py-2 flex-1">
            <Search size={18} className="text-white/40" />
            <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-full" />
          </div>
          <NeonButton 
            onClick={() => window.location.href = '/appointments'}
            className="flex-1 md:flex-none h-14"
          >
            Book Appointment
          </NeonButton>
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => window.location.href = '/checkup'}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-accent hover:bg-accent hover:text-black transition-all duration-300"
              title="Fitness Checkup"
            >
              <HeartPulse size={24} />
            </button>
            <button 
              onClick={() => setShowCustomize(true)}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-accent transition-colors"
            >
              <Settings2 size={24} />
            </button>
            <button className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-accent transition-colors">
              <Bell size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Dashboard Title */}
          <div className="space-y-1">
            <p className="text-white/40 text-sm font-medium uppercase tracking-wider">Patient Management</p>
            <h1 className="text-4xl md:text-6xl font-bold italic">Dashboard</h1>
          </div>

          {/* Calendar Strip */}
          {visibleSections.calendar && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between gap-2 overflow-x-auto hide-scrollbar py-2"
            >
              {weekDays.map((date, i) => {
                const isToday = i === 2;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center min-w-[64px] md:min-w-[80px] py-4 md:py-6 rounded-3xl transition-all duration-300",
                      isToday ? "bg-accent text-black scale-110 shadow-lg neon-glow" : "glass-card text-white/60"
                    )}
                  >
                    <span className="text-[10px] md:text-xs font-bold uppercase mb-1">{format(date, 'EEE')}</span>
                    <span className="text-xl md:text-2xl font-bold">{format(date, 'd')}</span>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Quick Stats Grid */}
          {visibleSections.stats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <GlassCard className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-white/50 text-xs font-medium">Virtual Care</span>
                  <Activity size={18} className="text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{virtualAppointmentsCount || 0}</h3>
                  <p className="text-white/40 text-[10px] uppercase font-bold">Sessions</p>
                </div>
              </GlassCard>

              <GlassCard className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-white/50 text-xs font-medium">Med Records</span>
                  <Droplets size={18} className="text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{medicalRecordsCount || 0}</h3>
                  <p className="text-white/40 text-[10px] uppercase font-bold">Files</p>
                </div>
              </GlassCard>

              <GlassCard className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-white/50 text-xs font-medium">Sleep</span>
                  <Moon size={18} className="text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{latestSleep.toFixed(1)}</h3>
                  <p className="text-white/40 text-[10px] uppercase font-bold">Hours</p>
                </div>
              </GlassCard>

              <GlassCard className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-white/50 text-xs font-medium">Calories</span>
                  <Activity size={18} className="text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{Math.round(latestCalories).toLocaleString()}</h3>
                  <p className="text-white/40 text-[10px] uppercase font-bold">kcal</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Upcoming Appointment Card */}
          {visibleSections.appointment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold text-white/60">id: 5523478</span>
                  <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                    <ArrowUpRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-white/40 text-[10px] uppercase font-bold">Date & Time</p>
                    <p className="text-sm md:text-base font-bold leading-tight">
                      {appointments?.[0] ? (
                        <>
                          {appointments[0].time}<br />
                          {(() => {
                            try {
                              return format(new Date(appointments[0].date), 'd MMM');
                            } catch (e) {
                              return 'N/A';
                            }
                          })()}
                        </>
                      ) : 'No Appointment'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40 text-[10px] uppercase font-bold">Doctor</p>
                    <div className="flex items-center gap-2">
                      {appointments?.[0] ? (
                        <>
                          <img 
                            src={doctors?.find(d => d.id === appointments[0].doctorId)?.image || undefined} 
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover" 
                            alt="Doc"
                          />
                          <p className="text-sm md:text-base font-bold">
                            {doctors?.find(d => d.id === appointments[0].doctorId)?.name?.split(' ').pop()}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm md:text-base font-bold">None</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40 text-[10px] uppercase font-bold">Type</p>
                    <p className="text-sm md:text-base font-bold uppercase">
                      {appointments?.[0]?.type || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="pt-4">
                  <div className="flex justify-between text-[10px] font-bold text-white/30 mb-2">
                    <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                  </div>
                  <div className="h-12 glass-panel rounded-2xl flex items-center px-4 gap-2">
                    <div className="h-1 w-full bg-white/10 rounded-full relative">
                      <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-16 h-4 bg-accent rounded-full neon-glow flex items-center justify-center">
                        <div className="w-2 h-2 bg-black rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Sidebar content for Desktop */}
        {visibleSections.vitals && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Daily Vitals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                <StatMini icon={Activity} value={Math.round(latestSteps)} label="Steps" color="text-accent" />
                <StatMini icon={Droplets} value={latestWater.toFixed(1)} label="Water (L)" color="text-blue-400" />
                <StatMini icon={Heart} value={Math.round(latestHeart)} label="BPM" color="text-red-400" />
              </div>
            </div>

            <GlassCard className="p-6 bg-accent/5 border-accent/20">
              <h4 className="font-bold mb-2">Health Tip</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                Drinking water before meals can help with digestion and maintain energy levels throughout the day.
              </p>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* Customize Modal */}
      <AnimatePresence>
        {showCustomize && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowCustomize(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card p-8 space-y-6 relative z-10"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Customize Dashboard</h3>
                <button onClick={() => setShowCustomize(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <CustomizeToggle 
                  label="Calendar Strip" 
                  active={visibleSections.calendar} 
                  onToggle={() => toggleSection('calendar')} 
                />
                <CustomizeToggle 
                  label="Quick Stats" 
                  active={visibleSections.stats} 
                  onToggle={() => toggleSection('stats')} 
                />
                <CustomizeToggle 
                  label="Upcoming Appointment" 
                  active={visibleSections.appointment} 
                  onToggle={() => toggleSection('appointment')} 
                />
                <CustomizeToggle 
                  label="Daily Vitals" 
                  active={visibleSections.vitals} 
                  onToggle={() => toggleSection('vitals')} 
                />
              </div>

              <NeonButton onClick={() => setShowCustomize(false)} className="w-full">
                Save Layout
              </NeonButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomizeToggle = ({ label, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 glass-card">
    <span className="font-medium">{label}</span>
    <button 
      onClick={onToggle}
      className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        active ? "bg-accent text-black" : "bg-white/5 text-white/40"
      )}
    >
      {active ? <Eye size={20} /> : <EyeOff size={20} />}
    </button>
  </div>
);

const StatMini = ({ icon: Icon, value, label, color }: any) => (
  <GlassCard className="p-3 flex flex-col items-center gap-1">
    <Icon size={16} className={color} />
    <span className="text-lg font-bold">{value}</span>
    <span className="text-[8px] uppercase font-bold text-white/40">{label}</span>
  </GlassCard>
);
