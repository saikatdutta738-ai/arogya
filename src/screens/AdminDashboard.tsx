import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { GlassCard } from '../components/UI';
import { Users, Activity, Calendar, Search, ArrowLeft, User as UserIcon, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  age?: number;
  bloodGroup?: string;
}

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('name'));
        const snapshot = await getDocs(q);
        const userData = snapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id // Ensure uid is present from doc id if not in data
        } as UserProfile));
        setUsers(userData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'helloworld') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin password');
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 p-6">
        <GlassCard className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto text-accent">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold italic">Admin Access</h2>
            <p className="text-white/40 text-sm">Please enter the admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:border-accent transition-colors text-center text-lg tracking-widest"
                autoFocus
              />
              {error && <p className="text-red-400 text-xs text-center font-bold uppercase tracking-widest">{error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full h-14 rounded-2xl bg-accent text-black font-bold hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all"
            >
              Authenticate
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-32 pt-8 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-accent transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold italic">Admin Dashboard</h1>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Global User Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 glass-card px-4 py-2 w-full md:w-64">
            <Search size={18} className="text-white/40" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-full" 
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Users" value={users.length} color="text-blue-400" />
        <StatCard icon={Shield} label="Admins" value={users.filter(u => u.role === 'admin').length} color="text-accent" />
        <StatCard icon={Activity} label="Active Patients" value={users.filter(u => u.role === 'user').length} color="text-green-400" />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">User Directory</h2>
        <div className="grid gap-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{user.name}</h3>
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Mail size={12} />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Badge label={user.role} color={user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-blue-400/20 text-blue-400'} />
                  {user.age && <Badge label={`${user.age} Yrs`} color="bg-white/10 text-white/60" />}
                  {user.bloodGroup && <Badge label={user.bloodGroup} color="bg-red-400/20 text-red-400" />}
                  
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl glass-card p-8 space-y-8 relative"
          >
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <UserIcon size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{selectedUser.name}</h2>
                <p className="text-white/40 font-medium uppercase tracking-widest text-xs">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DetailItem label="Role" value={selectedUser.role} />
              <DetailItem label="Age" value={selectedUser.age ? `${selectedUser.age} Yrs` : 'N/A'} />
              <DetailItem label="Blood" value={selectedUser.bloodGroup || 'N/A'} />
              <DetailItem label="UID" value={selectedUser.uid.slice(-8)} />
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold uppercase tracking-widest transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
    <p className="text-[10px] font-bold uppercase text-white/40 tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-accent uppercase">{value}</p>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <GlassCard className="p-6 flex items-center gap-4">
    <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", color)}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </GlassCard>
);

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", color)}>
    {label}
  </span>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
