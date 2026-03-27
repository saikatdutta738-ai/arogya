import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db as localDb, clearDatabase, runDb } from '../db';
import { auth, db as firestoreDb, doc, getDoc, logout, handleFirestoreError, OperationType } from '../firebase';
import { GlassCard, NeonButton } from '../components/UI';
import { User, Phone, Droplet, Ruler, Weight, ShieldAlert, FileText, Settings, LogOut, Activity, Trash2, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Profile: React.FC = () => {
  const localUser = useLiveQuery(() => localDb.userProfile.toCollection().first());
  const [firestoreUser, setFirestoreUser] = useState<any>(null);
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchFirestoreUser = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(firestoreDb, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setFirestoreUser(userDoc.data());
          }
        } catch (error) {
          console.error('Failed to fetch firestore user:', error);
        }
      }
    };
    fetchFirestoreUser();
  }, []);

  const user = firestoreUser || localUser;
  const isAdmin = firestoreUser?.role === 'admin';

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to delete all your profile data and health records? This action cannot be undone.')) {
      await clearDatabase();
      await logout();
      window.location.href = '/onboarding';
    }
  };

  const handleSignOut = async () => {
    await logout();
    localStorage.removeItem('onboarded');
    window.location.reload();
  };

  return (
    <div className="pb-32 pt-8 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-accent transition-colors"
          >
            <X size={20} className="rotate-90" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold italic">Patient Profile</h1>
        </div>
        <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
          <button 
            onClick={() => window.location.href = '/appointment'}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold text-xs uppercase tracking-wider neon-glow hover:scale-105 transition-transform"
          >
            Book Appointment
          </button>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-12 h-12 rounded-xl bg-accent/20 text-accent border border-accent/20 flex items-center justify-center hover:bg-accent/30 transition-colors"
                title="Admin Panel"
              >
                <ShieldCheck size={20} />
              </button>
            )}
            <button className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-white/70">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4 glass-card p-8 group relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-accent p-1 overflow-hidden">
                <img src={user?.avatar || auth.currentUser?.photoURL || undefined} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full border-4 border-slate-950 flex items-center justify-center text-black hover:scale-110 transition-transform shadow-lg"
              >
                <Settings size={18} />
              </button>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold">{user?.name || auth.currentUser?.displayName}</h2>
              <p className="text-white/40 font-medium uppercase tracking-widest text-xs mt-1">
                {isAdmin ? 'Administrator' : `Patient ID: #${user?.uid?.slice(-7) || '5523478'}`}
              </p>
              <button 
                onClick={() => setShowEditModal(true)}
                className="mt-4 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ActionCard icon={FileText} label="Medical Records" onClick={() => navigate('/records')} />
            <ActionCard icon={Activity} label="Health History" onClick={() => navigate('/track')} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Health ID Card */}
          <GlassCard className="p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              <ProfileStat icon={User} label="Age" value={`${user?.age || '25'} Yrs`} />
              <ProfileStat icon={Droplet} label="Blood" value={user?.bloodGroup || 'O+'} />
              <ProfileStat icon={Ruler} label="Height" value={user?.height || '170 cm'} />
              <ProfileStat icon={Weight} label="Weight" value={user?.weight || '70 kg'} />
            </div>
          </GlassCard>

          {/* Medical Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Medical Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoRow icon={ShieldAlert} label="Allergies" value={user?.allergies?.join(', ') || 'None'} color="text-red-400" />
              <InfoRow icon={Activity} label="Conditions" value={user?.conditions?.join(', ') || 'None'} color="text-yellow-400" />
              <InfoRow icon={Phone} label="Emergency" value={user?.emergencyContact || 'Not Set'} color="text-accent" />
              <InfoRow icon={FileText} label="Insurance" value="Blue Cross #9921" color="text-blue-400" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={handleSignOut}
              className="px-12 py-4 rounded-3xl glass-card text-white/70 font-bold flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Sign Out
            </button>
            <button 
              onClick={handleReset}
              className="px-12 py-4 rounded-3xl glass-card text-red-400 font-bold flex items-center justify-center gap-2 border-red-400/20"
            >
              <Trash2 size={20} />
              Reset All Data
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal 
            user={user} 
            onClose={() => setShowEditModal(false)} 
            onUpdate={() => window.location.reload()}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EditProfileModal = ({ user, onClose, onUpdate }: { user: any, onClose: () => void, onUpdate: () => void }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    bloodGroup: user?.bloodGroup || '',
    height: user?.height || '',
    weight: user?.weight || '',
    emergencyContact: user?.emergencyContact || '',
    avatar: user?.avatar || '',
    allergies: user?.allergies?.join(', ') || '',
    conditions: user?.conditions?.join(', ') || ''
  });

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
  ];

  const handleSave = async () => {
    try {
      const localUser = await localDb.userProfile.toCollection().first();
      const updatedData = {
        ...formData,
        allergies: formData.allergies.split(',').map(item => item.trim()).filter(item => item !== ''),
        conditions: formData.conditions.split(',').map(item => item.trim()).filter(item => item !== '')
      };
      if (localUser?.id) {
        await runDb(() => localDb.userProfile.update(localUser.id!, updatedData));
      } else {
        await runDb(() => localDb.userProfile.add(updatedData as any));
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass-card p-8 space-y-8 relative my-auto"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold italic">Edit Profile</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Choose Avatar</label>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {avatars.map((url) => (
                <button
                  key={url}
                  onClick={() => setFormData({ ...formData, avatar: url })}
                  className={cn(
                    "w-16 h-16 rounded-full border-2 transition-all p-0.5 shrink-0",
                    formData.avatar === url ? "border-accent scale-110" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={url} alt="Avatar" className="w-full h-full rounded-full bg-white/10" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Age</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Blood Group</label>
              <input 
                type="text" 
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Emergency Contact</label>
              <input 
                type="text" 
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Height (cm)</label>
              <input 
                type="text" 
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Weight (kg)</label>
              <input 
                type="text" 
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Allergies (comma separated)</label>
              <input 
                type="text" 
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Conditions (comma separated)</label>
              <input 
                type="text" 
                value={formData.conditions}
                onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <NeonButton onClick={handleSave} className="flex-[2] h-14">
            Save Changes
          </NeonButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProfileStat = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
      <Icon size={20} className="text-accent" />
    </div>
    <div>
      <p className="text-[10px] uppercase font-bold text-white/40">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, color }: any) => (
  <GlassCard className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      <Icon size={20} className={color} />
      <span className="text-sm font-medium text-white/60">{label}</span>
    </div>
    <span className="text-sm font-bold">{value}</span>
  </GlassCard>
);

const ActionCard = ({ icon: Icon, label, onClick }: any) => (
  <GlassCard 
    onClick={onClick}
    className="p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:bg-white/20 transition-colors"
  >
    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
      <Icon size={24} className="text-accent" />
    </div>
    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
  </GlassCard>
);
