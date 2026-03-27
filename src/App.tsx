import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './screens/Dashboard';
import { Onboarding } from './screens/Onboarding';
import { AppointmentBooking } from './screens/AppointmentBooking';
import { HealthTracker } from './screens/HealthTracker';
import { Records } from './screens/Records';
import { Profile } from './screens/Profile';
import { FitnessCheckup } from './screens/FitnessCheckup';
import { AdminDashboard } from './screens/AdminDashboard';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { seedDatabase, db as localDb, runDb } from './db';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence } from 'motion/react';
import { Home, Calendar, Activity, FileText, User, ShieldCheck, HeartPulse } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from './lib/utils';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    const init = async () => {
      try {
        await seedDatabase();
      } catch (error) {
        console.error('Failed to seed database:', error);
      }
      
      const isOnboarded = localStorage.getItem('onboarded') === 'true';
      setOnboarded(isOnboarded);
      setUserRole('user');
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HeartPulse size={32} className="text-accent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/onboarding" element={<Onboarding onComplete={() => setOnboarded(true)} />} />
          <Route
            path="/*"
            element={
              onboarded ? (
                <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
                  <Sidebar userRole={userRole} />
                  <main className="flex-1 relative overflow-x-hidden min-h-screen flex flex-col">
                    <MainLayout userRole={userRole} />
                  </main>
                </div>
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

function Sidebar({ userRole }: { userRole: 'admin' | 'user' }) {
  const localUser = useLiveQuery(() => localDb.userProfile.toCollection().first());
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Calendar, path: '/appointments', label: 'Schedule' },
    { icon: Activity, path: '/track', label: 'Track' },
    { icon: HeartPulse, path: '/checkup', label: 'Checkup' },
    { icon: FileText, path: '/records', label: 'Records' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  if (userRole === 'admin') {
    navItems.push({ icon: ShieldCheck, path: '/admin', label: 'Admin' });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 z-50">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(0,255,255,0.4)]">
          <HeartPulse size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tighter">ArogyaPlus</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group",
                isActive ? "bg-accent text-black font-bold shadow-lg neon-glow" : "text-white/50 hover:text-white hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={cn("transition-colors", isActive ? "text-black" : "group-hover:text-accent")} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full border border-accent/50 p-0.5">
            <img src={localUser?.avatar || undefined} className="w-full h-full rounded-full object-cover" alt="User" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{localUser?.name || 'User'}</p>
            <p className="text-[10px] text-white/40 uppercase font-bold">{userRole === 'admin' ? 'Administrator' : 'Pro Member'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MainLayout({ userRole }: { userRole: 'admin' | 'user' }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<AppointmentBooking />} />
            <Route path="/track" element={<HealthTracker />} />
            <Route path="/checkup" element={<FitnessCheckup />} />
            <Route path="/records" element={<Records />} />
            <Route path="/profile" element={<Profile />} />
            {userRole === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
