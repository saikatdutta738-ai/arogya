import React, { useState } from 'react';
import { GlassCard, NeonButton } from '../components/UI';
import { Activity, Droplets, Heart, Thermometer, Wind, AlertTriangle, CheckCircle2, Info, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface HealthData {
  bloodSugar: string;
  cholesterol: string;
  bloodOxygen: string;
  systolicBP: string;
  diastolicBP: string;
  heartRate: string;
}

interface AssessmentResult {
  status: 'Healthy' | 'Moderate Risk' | 'High Risk';
  color: string;
  message: string;
  details: { label: string; status: string; color: string }[];
}

export const FitnessCheckup: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<HealthData>({
    bloodSugar: '',
    cholesterol: '',
    bloodOxygen: '',
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
  });

  const [result, setResult] = useState<AssessmentResult | null>(null);

  const calculateRisk = () => {
    const sugar = parseFloat(data.bloodSugar);
    const chol = parseFloat(data.cholesterol);
    const oxygen = parseFloat(data.bloodOxygen);
    const sys = parseFloat(data.systolicBP);
    const dia = parseFloat(data.diastolicBP);
    const hr = parseFloat(data.heartRate);

    if (isNaN(sugar) || isNaN(chol) || isNaN(oxygen) || isNaN(sys) || isNaN(dia) || isNaN(hr)) {
      alert("Please fill in all fields with valid numbers.");
      return;
    }

    const details: AssessmentResult['details'] = [];
    let riskPoints = 0;

    // Blood Sugar
    if (sugar < 100) details.push({ label: 'Blood Sugar', status: 'Normal', color: 'text-green-400' });
    else if (sugar <= 125) { details.push({ label: 'Blood Sugar', status: 'Prediabetes', color: 'text-yellow-400' }); riskPoints += 1; }
    else { details.push({ label: 'Blood Sugar', status: 'Diabetes Range', color: 'text-red-400' }); riskPoints += 2; }

    // Cholesterol
    if (chol < 200) details.push({ label: 'Cholesterol', status: 'Normal', color: 'text-green-400' });
    else if (chol <= 239) { details.push({ label: 'Cholesterol', status: 'Borderline', color: 'text-yellow-400' }); riskPoints += 1; }
    else { details.push({ label: 'Cholesterol', status: 'High', color: 'text-red-400' }); riskPoints += 2; }

    // Blood Oxygen
    if (oxygen >= 95) details.push({ label: 'Blood Oxygen', status: 'Normal', color: 'text-green-400' });
    else { details.push({ label: 'Blood Oxygen', status: 'Low', color: 'text-red-400' }); riskPoints += 2; }

    // Blood Pressure
    if (sys < 120 && dia < 80) details.push({ label: 'Blood Pressure', status: 'Normal', color: 'text-green-400' });
    else if (sys < 130 && dia < 80) { details.push({ label: 'Blood Pressure', status: 'Elevated', color: 'text-yellow-400' }); riskPoints += 1; }
    else { details.push({ label: 'Blood Pressure', status: 'Hypertension', color: 'text-red-400' }); riskPoints += 2; }

    // Heart Rate
    if (hr >= 60 && hr <= 100) details.push({ label: 'Heart Rate', status: 'Normal', color: 'text-green-400' });
    else { details.push({ label: 'Heart Rate', status: 'Irregular', color: 'text-yellow-400' }); riskPoints += 1; }

    let status: AssessmentResult['status'] = 'Healthy';
    let color = 'text-green-400';
    let message = 'Your health metrics are within the normal range. Keep up the good work!';

    if (riskPoints >= 4) {
      status = 'High Risk';
      color = 'text-red-400';
      message = 'Several metrics are outside the healthy range. We strongly recommend consulting a healthcare professional.';
    } else if (riskPoints > 0) {
      status = 'Moderate Risk';
      color = 'text-yellow-400';
      message = 'Some metrics are slightly elevated. Consider lifestyle adjustments and regular monitoring.';
    }

    setResult({ status, color, message, details });
  };

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
            <p className="text-accent text-[10px] font-bold uppercase tracking-widest">Health Assessment</p>
            <h1 className="text-2xl md:text-3xl font-bold italic">Fitness Checkup</h1>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <GlassCard className="p-8 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Info size={20} className="text-accent" />
            <h3 className="text-lg font-bold">Enter Your Vitals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
              label="Blood Sugar (mg/dL)" 
              icon={Droplets} 
              value={data.bloodSugar} 
              onChange={(v) => setData({...data, bloodSugar: v})} 
              placeholder="e.g. 95"
            />
            <InputGroup 
              label="Cholesterol (mg/dL)" 
              icon={Activity} 
              value={data.cholesterol} 
              onChange={(v) => setData({...data, cholesterol: v})} 
              placeholder="e.g. 180"
            />
            <InputGroup 
              label="Blood Oxygen (%)" 
              icon={Wind} 
              value={data.bloodOxygen} 
              onChange={(v) => setData({...data, bloodOxygen: v})} 
              placeholder="e.g. 98"
            />
            <InputGroup 
              label="Heart Rate (BPM)" 
              icon={Heart} 
              value={data.heartRate} 
              onChange={(v) => setData({...data, heartRate: v})} 
              placeholder="e.g. 72"
            />
            <InputGroup 
              label="Systolic BP (mmHg)" 
              icon={Activity} 
              value={data.systolicBP} 
              onChange={(v) => setData({...data, systolicBP: v})} 
              placeholder="e.g. 120"
            />
            <InputGroup 
              label="Diastolic BP (mmHg)" 
              icon={Activity} 
              value={data.diastolicBP} 
              onChange={(v) => setData({...data, diastolicBP: v})} 
              placeholder="e.g. 80"
            />
          </div>

          <NeonButton onClick={calculateRisk} className="w-full h-14 mt-4">
            Analyze Health Status
          </NeonButton>
        </GlassCard>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Assessment Result</h3>
                  <div className={cn("flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10", result.color)}>
                    {result.status === 'Healthy' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span className="text-xs font-bold uppercase tracking-wider">{result.status}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <p className="text-lg font-medium leading-relaxed italic">
                      "{result.message}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-white/40 tracking-widest">Metric Breakdown</h4>
                    <div className="grid gap-3">
                      {result.details.map((detail, i) => (
                        <div key={i} className="flex items-center justify-between p-4 glass-card">
                          <span className="font-medium">{detail.label}</span>
                          <span className={cn("text-sm font-bold", detail.color)}>{detail.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <NeonButton 
                      onClick={() => navigate('/appointments')} 
                      className="w-full h-14 flex items-center justify-center gap-3"
                    >
                      <Activity size={20} />
                      Book Appointment
                    </NeonButton>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-[10px] text-white/30 uppercase font-bold text-center leading-relaxed">
                    Disclaimer: This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full glass-card p-12 border-dashed border-2 border-white/10"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent/40">
                  <Activity size={40} />
                </div>
                <p className="text-white/40 font-medium">Enter your data to see your health risk assessment</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon: Icon, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase text-white/40 tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 glass-card pl-12 pr-4 outline-none focus:border-accent/50 transition-colors text-sm"
      />
    </div>
  </div>
);
