import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, runDb, type MedicalRecord } from '../db';
import { GlassCard, NeonButton } from '../components/UI';
import { FileText, Download, Search, Filter, Calendar, Plus, X, Stethoscope, Syringe, ClipboardList, Upload, Eye, Trash2, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const CATEGORIES = ['All', 'Lab Report', 'Prescription', 'Visit', 'Vaccination'];

export const Records: React.FC = () => {
  const records = useLiveQuery(() => db.medicalRecords.orderBy('date').reverse().toArray());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredRecords = records?.filter(r => {
    const matchesSearch = (r.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
                         (r.doctorName?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Lab Report': return FileText;
      case 'Prescription': return ClipboardList;
      case 'Visit': return Stethoscope;
      case 'Vaccination': return Syringe;
      default: return FileText;
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await runDb(() => db.medicalRecords.delete(id));
    }
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
          <div className="space-y-1">
            <p className="text-accent text-[10px] font-bold uppercase tracking-widest">Health History</p>
            <h1 className="text-3xl md:text-5xl font-bold italic">Medical Records</h1>
          </div>
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
            className="w-12 h-12 rounded-xl bg-accent text-black shadow-lg neon-glow flex items-center justify-center md:hidden shrink-0"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
        <div className="flex-1 h-14 glass-card flex items-center px-4 gap-3 text-white/40 focus-within:border-accent/50 transition-colors">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search by title or doctor..." 
            className="bg-transparent outline-none text-sm w-full text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 whitespace-nowrap",
                activeCategory === cat ? "bg-accent text-black shadow-lg neon-glow" : "glass-card text-white/60 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords?.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-32 space-y-4">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
              <FileText size={48} className="text-white/10" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold text-lg">No records found</p>
              <p className="text-white/40 text-sm">Try adjusting your search or category filters</p>
            </div>
            <NeonButton onClick={() => setShowAddModal(true)} className="mx-auto">
              Add First Record
            </NeonButton>
          </div>
        ) : (
          filteredRecords?.map((record) => {
            const Icon = getIcon(record.type);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={record.id}
              >
                <GlassCard 
                  className="p-6 flex flex-col gap-4 hover:bg-white/5 transition-all group border-white/5 hover:border-accent/30 cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      record.type === 'Lab Report' ? "bg-blue-500/10 text-blue-400" :
                      record.type === 'Prescription' ? "bg-purple-500/10 text-purple-400" :
                      record.type === 'Visit' ? "bg-green-500/10 text-green-400" :
                      "bg-orange-500/10 text-orange-400"
                    )}>
                      <Icon size={24} />
                    </div>
                    <div className="flex gap-2">
                      {record.fileUrl && (
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <FileCheck size={14} />
                        </div>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (record.id) handleDelete(record.id);
                        }}
                        className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-accent transition-colors truncate">{record.title}</h3>
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                      <Calendar size={12} />
                      {format(new Date(record.date), 'MMMM d, yyyy')}
                    </div>
                  </div>

                  {record.doctorName && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <Stethoscope size={12} className="text-white/40" />
                      </div>
                      <p className="text-xs text-white/60 font-medium">Dr. {record.doctorName}</p>
                    </div>
                  )}

                  {record.description && (
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed italic">
                      "{record.description}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className={cn(
                      "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest",
                      record.type === 'Lab Report' ? "bg-blue-500/20 text-blue-400" :
                      record.type === 'Prescription' ? "bg-purple-500/20 text-purple-400" :
                      record.type === 'Visit' ? "bg-green-500/20 text-green-400" :
                      "bg-orange-500/20 text-orange-400"
                    )}>
                      {record.type}
                    </span>
                    <div className="flex items-center gap-1 text-accent text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <Eye size={12} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Desktop Add Button */}
      <div className="hidden md:block fixed bottom-12 right-12">
        <NeonButton 
          onClick={() => setShowAddModal(true)}
          className="w-16 h-16 rounded-full p-0 flex items-center justify-center"
        >
          <Plus size={32} />
        </NeonButton>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddRecordModal onClose={() => setShowAddModal(false)} />
        )}
        {selectedRecord && (
          <RecordDetailsModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddRecordModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({
    title: '',
    type: 'Lab Report',
    date: new Date().toISOString().split('T')[0],
    doctorName: '',
    description: '',
    notes: '',
    fileUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileUrl: reader.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.type || !formData.date) return;
    await runDb(() => db.medicalRecords.add(formData as MedicalRecord));
    onClose();
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
        className="w-full max-w-2xl glass-card p-8 space-y-8 relative overflow-hidden my-auto"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
        
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold italic">Add New Record</h3>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Securely store your medical documents</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Record Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              placeholder="e.g. Blood Test Report - March 2024"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Category</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white appearance-none"
            >
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Date</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Doctor / Lab Name</label>
            <input 
              type="text" 
              value={formData.doctorName}
              onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
              className="w-full h-14 glass-card px-4 outline-none focus:border-accent/50 transition-colors text-white"
              placeholder="e.g. Apollo Diagnostics"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Upload Document</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                formData.fileUrl ? "border-accent/50 bg-accent/5" : "border-white/10 hover:border-accent/30 hover:bg-white/5"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,application/pdf"
              />
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
              ) : formData.fileUrl ? (
                <>
                  <FileCheck size={32} className="text-accent" />
                  <p className="text-xs font-bold text-accent">Document Attached Successfully</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({...formData, fileUrl: ''});
                    }}
                    className="text-[10px] text-white/40 hover:text-red-400 underline"
                  >
                    Remove File
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-white/20" />
                  <p className="text-xs font-bold text-white/40">Drop file here or click to upload</p>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest">Supports PDF, JPG, PNG</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Notes / Summary</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full h-24 glass-card p-4 outline-none focus:border-accent/50 transition-colors text-white resize-none"
              placeholder="Brief summary of the report or visit..."
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <NeonButton onClick={handleAdd} className="flex-[2] h-14">
            Save Record
          </NeonButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RecordDetailsModal = ({ record, onClose }: { record: MedicalRecord, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-3xl glass-card p-8 space-y-8 relative my-auto"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className={cn(
              "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest",
              record.type === 'Lab Report' ? "bg-blue-500/20 text-blue-400" :
              record.type === 'Prescription' ? "bg-purple-500/20 text-purple-400" :
              record.type === 'Visit' ? "bg-green-500/20 text-green-400" :
              "bg-orange-500/20 text-orange-400"
            )}>
              {record.type}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold italic">{record.title}</h2>
            <div className="flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {format(new Date(record.date), 'MMMM d, yyyy')}
              </div>
              {record.doctorName && (
                <div className="flex items-center gap-1">
                  <Stethoscope size={14} />
                  Dr. {record.doctorName}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Description</h4>
              <p className="text-white/80 leading-relaxed italic">
                {record.description || "No description provided."}
              </p>
            </div>
            
            {record.notes && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Additional Notes</h4>
                <p className="text-white/60 text-sm leading-relaxed">
                  {record.notes}
                </p>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <NeonButton className="flex-1 h-14">
                <Download size={20} className="mr-2" /> Download Original
              </NeonButton>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Document Preview</h4>
            <div className="aspect-[3/4] glass-card rounded-3xl overflow-hidden border-white/10 flex items-center justify-center bg-white/5">
              {record.fileUrl ? (
                record.fileUrl.startsWith('data:image') ? (
                  <img src={record.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/20">
                    <FileText size={64} />
                    <p className="text-xs font-bold uppercase tracking-widest">PDF Document</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/10">
                  <FileText size={64} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No File Attached</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

