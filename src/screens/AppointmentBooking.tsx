import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, runDb } from '../db';
import { GlassCard, NeonButton } from '../components/UI';
import { Search, Star, Clock, Video, MapPin, ChevronLeft, Heart, Navigation, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const AppointmentBooking: React.FC = () => {
  const doctors = useLiveQuery(() => db.doctors.toArray());
  const [search, setSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const navigate = useNavigate();

  const detectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state;
          setUserLocation(city);
          setLocationSearch(city);
        } catch (error) {
          console.error("Error fetching location name:", error);
        } finally {
          setIsDetecting(false);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        setIsDetecting(false);
      });
    } else {
      setIsDetecting(false);
    }
  };

  const filteredDoctors = doctors?.filter(d => {
    const matchesSearch = (d.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (d.specialization?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesLocation = !locationSearch || (d.location?.toLowerCase() || '').includes(locationSearch.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="pb-32 pt-8 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-accent transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="space-y-1">
            <p className="text-accent text-[10px] font-bold uppercase tracking-widest">Health Care</p>
            <h1 className="text-2xl md:text-3xl font-bold italic">Book Appointment</h1>
          </div>
        </div>
        <button className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70 shrink-0">
          <Heart size={24} />
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search doctor or specialization..."
            className="w-full h-14 glass-card pl-12 pr-4 outline-none focus:border-accent/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              type="text"
              placeholder="Search by location (City, State)..."
              className="w-full h-14 glass-card pl-12 pr-14 outline-none focus:border-accent/50 transition-colors"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
            <button 
              onClick={detectLocation}
              disabled={isDetecting}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl glass-card flex items-center justify-center text-accent hover:bg-white/10 transition-colors",
                isDetecting && "animate-pulse"
              )}
            >
              <Navigation size={18} />
            </button>
          </div>
          <button 
            onClick={() => setLocationSearch('Raiganj')}
            className={cn(
              "px-4 h-14 rounded-2xl glass-card text-xs font-bold uppercase tracking-widest transition-all",
              locationSearch === 'Raiganj' ? "bg-accent text-black border-accent" : "text-white/40 hover:text-accent"
            )}
          >
            Raiganj
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold">Available Specialists</h2>
          {userLocation && (
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Near <span className="text-accent">{userLocation}</span>
            </p>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors?.map((doc) => (
            <GlassCard 
              key={doc.id} 
              className="flex flex-col gap-4 p-5 cursor-pointer hover:bg-white/5 transition-all group border-white/5 hover:border-accent/30"
              onClick={() => setSelectedDoctor(doc)}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                  <img src={doc.image || undefined} alt={doc.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-accent text-[10px] font-bold uppercase tracking-wider">{doc.specialization}</p>
                  <h3 className="text-lg font-bold truncate group-hover:text-accent transition-colors">{doc.name}</h3>
                  <p className="text-[10px] text-white/60 font-medium italic mb-1">{doc.degree}</p>
                  <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold uppercase mt-1">
                    <MapPin size={10} />
                    <span className="truncate">{doc.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4 text-white/60 text-xs">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{doc.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span className="font-bold">{doc.experience}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold text-lg">₹{doc.fee}</span>
                  <div className={cn("w-2 h-2 rounded-full", doc.status === 'online' ? "bg-green-400" : "bg-red-400")} />
                </div>
              </div>
            </GlassCard>
          ))}
          {filteredDoctors?.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Search size={40} className="text-white/20" />
              </div>
              <p className="text-white/40 font-medium">No doctors found in this location</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedDoctor && (
          <DoctorDetailsModal 
            doctor={selectedDoctor} 
            onClose={() => setSelectedDoctor(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DoctorDetailsModal = ({ doctor, onClose }: { doctor: any, onClose: () => void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('13:00');
  const [type, setType] = useState<'visit' | 'virtual'>('visit');
  const [booked, setBooked] = useState(false);
  const navigate = useNavigate();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  const handleBook = async () => {
    await runDb(() => db.appointments.add({
      doctorId: doctor.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      type,
      status: 'upcoming'
    }));
    setBooked(true);
  };

  const handleWhatsApp = () => {
    const message = `Hello ${doctor.name}, I have booked a ${type} appointment for ${format(selectedDate, 'PPP')} at ${selectedTime}.`;
    const url = `https://wa.me/${doctor.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${doctor.phone}`;
  };

  if (booked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[110] bg-slate-950 flex items-center justify-center p-6"
      >
        <GlassCard className="w-full max-w-md p-8 text-center space-y-8 border-accent/20">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-accent" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold italic">Booking Confirmed!</h2>
            <p className="text-white/60 text-sm">Your appointment with {doctor.name} has been scheduled.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleCall}
              className="h-14 rounded-2xl glass-card flex items-center justify-center gap-3 text-accent font-bold hover:bg-accent/10 transition-all"
            >
              <Phone size={20} />
              Call
            </button>
            <button 
              onClick={handleWhatsApp}
              className="h-14 rounded-2xl glass-card flex items-center justify-center gap-3 text-green-400 font-bold hover:bg-green-400/10 transition-all"
            >
              <MessageSquare size={20} />
              WhatsApp
            </button>
          </div>

          <button 
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className="w-full h-14 rounded-2xl bg-white text-black font-bold"
          >
            Back to Home
          </button>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto hide-scrollbar"
    >
      <div className="relative h-[40vh] w-full">
        <img src={doctor.image || undefined} alt={doctor.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        <button 
          onClick={onClose}
          className="absolute top-8 left-6 w-12 h-12 rounded-full glass-card flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="px-6 -mt-20 relative space-y-8 pb-12 max-w-4xl mx-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-accent text-sm font-bold uppercase tracking-widest">{doctor.specialization}</p>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold uppercase">
              <MapPin size={12} />
              {doctor.location}
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">{doctor.name}</h2>
          <p className="text-lg text-white/60 font-medium italic">{doctor.degree}</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", doctor.status === 'online' ? "bg-green-400" : "bg-red-400")} />
            <span className="text-white/60 text-sm uppercase font-bold tracking-widest">{doctor.status}</span>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          <StatBadge icon={Star} value={doctor.rating} label="Rating" />
          <StatBadge icon={Clock} value={doctor.experience} label="Exp" />
          <StatBadge icon={MapPin} value={`₹${doctor.fee}`} label="Fee" />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-widest text-white/40 text-[10px]">About Doctor</h3>
          <p className="text-white/60 leading-relaxed italic">
            {doctor.about}
          </p>
          <button 
            onClick={() => window.open(`https://wbmc.wb.gov.in/index.php/doctor_search?name=${encodeURIComponent(doctor.name)}`, '_blank')}
            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-2"
          >
            <CheckCircle2 size={12} />
            Verify Registration on WBMC
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-widest text-white/40 text-[10px]">Select Visit Type</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => setType('visit')}
              className={cn(
                "flex-1 h-16 rounded-3xl flex items-center justify-center gap-3 transition-all duration-300 border",
                type === 'visit' ? "bg-white text-black font-bold border-white shadow-lg" : "glass-card text-white/60 border-white/5"
              )}
            >
              <MapPin size={20} />
              In-Person
            </button>
            <button 
              onClick={() => setType('virtual')}
              className={cn(
                "flex-1 h-16 rounded-3xl flex items-center justify-center gap-3 transition-all duration-300 border",
                type === 'virtual' ? "bg-white text-black font-bold border-white shadow-lg" : "glass-card text-white/60 border-white/5"
              )}
            >
              <Video size={20} />
              Virtual
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-widest text-white/40 text-[10px]">Schedule</h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
            {weekDays.map((date, i) => {
              const isSelected = format(date, 'd') === format(selectedDate, 'd');
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center min-w-[72px] py-5 rounded-3xl transition-all duration-300 cursor-pointer border",
                    isSelected ? "bg-accent text-black scale-105 shadow-lg neon-glow border-accent" : "glass-card text-white/60 border-white/5"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase mb-1">{format(date, 'EEE')}</span>
                  <span className="text-2xl font-bold">{format(date, 'd')}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {times.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={cn(
                  "py-4 rounded-2xl text-sm font-bold transition-all duration-300 border",
                  selectedTime === t ? "bg-accent text-black neon-glow border-accent" : "glass-card text-white/60 border-white/5"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <NeonButton onClick={handleBook} className="w-full h-16 text-lg">
          Confirm Booking • ₹{doctor.fee}
        </NeonButton>
      </div>
    </motion.div>
  );
};

const StatBadge = ({ icon: Icon, value, label }: any) => (
  <GlassCard className="px-5 py-4 flex items-center gap-4 shrink-0 border-white/5">
    <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
      <Icon size={20} className="text-accent" />
    </div>
    <div>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest">{label}</p>
    </div>
  </GlassCard>
);
