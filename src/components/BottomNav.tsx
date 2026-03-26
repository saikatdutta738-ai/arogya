import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Activity, FileText, User, HeartPulse } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Calendar, path: '/appointments', label: 'Schedule' },
    { icon: HeartPulse, path: '/checkup', label: 'Checkup' },
    { icon: Activity, path: '/track', label: 'Track' },
    { icon: FileText, path: '/records', label: 'Records' },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="absolute bottom-6 left-6 right-6 z-50">
      <div className="glass-card flex items-center justify-around py-3 px-2 shadow-2xl border-white/10">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-accent/20 text-accent" : "text-white/50 hover:text-white"
              )
            }
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
