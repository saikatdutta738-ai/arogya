import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { NeonButton } from '../components/UI';
import { ChevronRight, Check, User, LogIn } from 'lucide-react';
import { db as localDb, runDb } from '../db';

const slides = [
  {
    title: "Health Journey Starts Here",
    description: "Ready to take control of your health? Just a few simple steps to begin.",
    image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=800",
    accent: "Global Health"
  },
  {
    title: "Expert Consultations",
    description: "Connect with top specialists from the comfort of your home.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    accent: "Virtual Care"
  },
  {
    title: "Track Your Progress",
    description: "Monitor your vitals and wellness metrics in real-time.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800",
    accent: "Smart Tracking"
  }
];

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: 25,
    gender: 'Other',
    bloodGroup: 'O+',
    height: '170 cm',
    weight: '70 kg',
    emergencyContact: '',
    allergies: [] as string[],
    conditions: [] as string[],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  });
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!profile.name) {
      alert('Please enter your name');
      return;
    }

    try {
      // Save to Local DB
      await runDb(async () => {
        await localDb.userProfile.clear();
        await localDb.userProfile.add(profile);
      });
      
      localStorage.setItem('onboarded', 'true');
      onComplete();
      navigate('/');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowProfileForm(true);
    }
  };

  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl glass-card p-8 space-y-8 my-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold">Create Your Profile</h2>
            <p className="text-white/40 mt-2">Let's personalize your health experience</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/40">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/40">Age</label>
              <input 
                type="number" 
                value={profile.age}
                onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/40">Blood Group</label>
              <select 
                value={profile.bloodGroup}
                onChange={e => setProfile({...profile, bloodGroup: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-accent transition-colors"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-white/40">Emergency Contact</label>
              <input 
                type="tel" 
                value={profile.emergencyContact}
                onChange={e => setProfile({...profile, emergencyContact: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-accent transition-colors"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <NeonButton onClick={handleComplete} className="w-full">
            Complete Setup
            <Check size={20} />
          </NeonButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto md:overflow-hidden bg-slate-950 flex flex-col md:flex-row">
      <motion.div
        key={current}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 md:relative md:flex-1 h-full"
      >
        <img
          src={slides[current].image}
          alt="Health"
          className="h-full w-full object-cover opacity-30 md:opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-slate-950/80 to-slate-950" />
      </motion.div>

      <div className="mt-auto md:mt-0 p-6 md:p-16 relative z-10 md:w-1/2 md:flex md:flex-col md:justify-center min-h-[60vh] md:min-h-screen">
        <div className="flex gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-8 bg-accent" : "w-2 bg-white/20"
              )}
            />
          ))}
        </div>

        <motion.span
          key={`accent-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] md:text-xs font-medium mb-4 border border-white/10"
        >
          {slides[current].accent}
        </motion.span>

        <motion.h1
          key={`title-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold leading-tight mb-4"
        >
          {slides[current].title}
        </motion.h1>

        <motion.p
          key={`desc-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/60 text-base md:text-lg mb-8 md:mb-12 max-w-xs"
        >
          {slides[current].description}
        </motion.p>

        <div className="flex items-center justify-between gap-4">
          <NeonButton onClick={next} className="flex-1 md:flex-none md:w-64 h-14">
            {current === slides.length - 1 ? 'Get Started' : 'Next'}
            {current === slides.length - 1 ? <Check size={20} /> : <ChevronRight size={20} />}
          </NeonButton>
        </div>
      </div>
    </div>
  );
};
