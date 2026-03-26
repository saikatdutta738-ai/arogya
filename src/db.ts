import Dexie, { type Table } from 'dexie';

export interface UserProfile {
  id?: number;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: string;
  avatar: string;
}

export interface Doctor {
  id?: number;
  name: string;
  specialization: string;
  degree: string;
  rating: number;
  fee: number;
  availability: string;
  status: 'online' | 'offline';
  image: string;
  experience: string;
  about: string;
  location: string;
  phone?: string;
}

export interface Appointment {
  id?: number;
  doctorId: number;
  date: string;
  time: string;
  type: 'visit' | 'virtual';
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Medication {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  mealRelation: 'before' | 'after' | 'any';
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface HealthMetric {
  id?: number;
  type: 'steps' | 'water' | 'heartRate' | 'sleep' | 'weight' | 'bp' | 'calories';
  value: number;
  unit: string;
  timestamp: number;
}

export interface LabReport {
  id?: number;
  testName: string;
  result: string;
  normalRange: string;
  date: string;
  note?: string;
}

export interface MedicalRecord {
  id?: number;
  title: string;
  type: 'Lab Report' | 'Prescription' | 'Visit' | 'Vaccination';
  date: string;
  doctorName?: string;
  description?: string;
  fileUrl?: string; // For future file upload support
  notes?: string;
}

export class HealthDatabase extends Dexie {
  userProfile!: Table<UserProfile>;
  doctors!: Table<Doctor>;
  appointments!: Table<Appointment>;
  medications!: Table<Medication>;
  healthMetrics!: Table<HealthMetric>;
  labReports!: Table<LabReport>;
  medicalRecords!: Table<MedicalRecord>;

  constructor() {
    super('HealthDatabase');
    this.version(3).stores({
      userProfile: '++id',
      doctors: '++id, specialization',
      appointments: '++id, doctorId, status, type',
      medications: '++id, active',
      healthMetrics: '++id, type, timestamp',
      labReports: '++id, date',
      medicalRecords: '++id, type, date'
    });
  }
}

export const db = new HealthDatabase();

export const runDb = async <T>(operation: () => Promise<T>): Promise<T | null> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Database operation failed:', error);
    const message = error?.message || error?.name || 'Unknown database error';
    throw new Error(message);
  }
};

export async function seedDatabase() {
  // Always update doctors to match the latest requested list
  await db.doctors.clear();
  await db.doctors.bulkAdd([
      {
        name: 'Dr. Arabinda Chakraborty',
        specialization: 'PATHOLOGY',
        degree: 'Diploma in Pathology',
        rating: 4.8,
        fee: 400,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '15 years',
        about: 'Specialist in Pathology with extensive experience.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Keshab Chandra Bandyopadhayay',
        specialization: 'G&O',
        degree: 'DGO, MD',
        rating: 4.9,
        fee: 500,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=200',
        experience: '20 years',
        about: 'Expert in Gynaecology and Obstetrics.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Kamal Krishna Sarkar',
        specialization: 'EYE',
        degree: 'DOMS, MS',
        rating: 4.7,
        fee: 450,
        availability: 'Tue, Thu, Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        experience: '18 years',
        about: 'Specialist Ophthalmologist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Asit kumar Bandyopadhayay',
        specialization: 'PEDIATRICS',
        degree: 'DCH, MD',
        rating: 4.9,
        fee: 400,
        availability: 'Daily',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '22 years',
        about: 'Senior Pediatrician.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Partha Sarathi Roy',
        specialization: 'MEDICINE',
        degree: 'DTM&H, MD, DIP.NBE',
        rating: 4.8,
        fee: 500,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '25 years',
        about: 'Specialist in Internal Medicine.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Gopal Poddar',
        specialization: 'ORTHO',
        degree: 'Diploma Ortha',
        rating: 4.7,
        fee: 450,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        experience: '16 years',
        about: 'Expert Orthopaedic Surgeon.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Sankar Prasad Das',
        specialization: 'ENT',
        degree: 'DLO',
        rating: 4.6,
        fee: 350,
        availability: 'Tue, Thu, Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '14 years',
        about: 'ENT Specialist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Sanjoy Seth',
        specialization: 'GENERAL SURGERY',
        degree: 'DCH, MS',
        rating: 4.8,
        fee: 600,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        experience: '15 years',
        about: 'General Surgeon at Raiganj.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Asit Kumar Biswas',
        specialization: 'EYE',
        degree: 'D.O',
        rating: 4.5,
        fee: 300,
        availability: 'Mon - Wed',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
        experience: '12 years',
        about: 'Ophthalmologist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Sanjoy Dey',
        specialization: 'PATHOLOGY',
        degree: 'MD',
        rating: 4.7,
        fee: 400,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '10 years',
        about: 'Pathologist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Surajit Majumder',
        specialization: 'ANAESTHESIOLOGY',
        degree: 'MD',
        rating: 4.8,
        fee: 500,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '14 years',
        about: 'Anaesthesiologist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Suresh Kumar Sarawgi',
        specialization: 'GENERAL SURGERY',
        degree: 'MS',
        rating: 4.9,
        fee: 700,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '20 years',
        about: 'Senior General Surgeon.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Anutosh Maiti',
        specialization: 'ENT',
        degree: 'DO, MS',
        rating: 4.7,
        fee: 450,
        availability: 'Tue, Thu, Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        experience: '16 years',
        about: 'ENT Specialist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Nilanjan Mukherjee',
        specialization: 'PEDIATRICS',
        degree: 'DCH, FCGP, DMCH',
        rating: 4.8,
        fee: 400,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '15 years',
        about: 'Pediatrician.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Abu Sadeque',
        specialization: 'PEDIATRICS',
        degree: 'MD',
        rating: 4.7,
        fee: 400,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '12 years',
        about: 'Pediatrician.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Narayan Chandra Paul',
        specialization: 'CHILD SPECIALIST',
        degree: 'DCH',
        rating: 4.9,
        fee: 350,
        availability: 'Daily',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '25 years',
        about: 'Senior Child Specialist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Bithi Biswas',
        specialization: 'G&O',
        degree: 'MS',
        rating: 4.8,
        fee: 500,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
        experience: '18 years',
        about: 'Gynaecologist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Arup kumar Seth',
        specialization: 'GENERAL SURGERY',
        degree: 'MS',
        rating: 4.7,
        fee: 600,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        experience: '15 years',
        about: 'General Surgeon.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Raja Basak',
        specialization: 'GENERAL SURGERY',
        degree: 'MS',
        rating: 4.8,
        fee: 600,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '14 years',
        about: 'General Surgeon.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Sanjoy Sarkar',
        specialization: 'G&O',
        degree: 'MS',
        rating: 4.9,
        fee: 500,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '16 years',
        about: 'Gynaecologist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Rabindranath Chattopadhyayay',
        specialization: 'SKIN',
        degree: 'MD',
        rating: 4.8,
        fee: 500,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '20 years',
        about: 'Dermatologist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Sk. Abdus Salam',
        specialization: 'PHYSICIAN',
        degree: 'MD',
        rating: 4.7,
        fee: 400,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '15 years',
        about: 'General Physician.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Ashok Kumar Mandal',
        specialization: 'DENTAL',
        degree: 'BDS',
        rating: 4.8,
        fee: 300,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
        experience: '12 years',
        about: 'Dentist.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. Sanjoy Guha',
        specialization: 'ORTHO',
        degree: 'MS',
        rating: 4.9,
        fee: 600,
        availability: 'Mon - Fri',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '18 years',
        about: 'Orthopaedic Surgeon.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      },
      {
        name: 'Dr. M.R.Ali',
        specialization: 'PEDIATRIC',
        degree: 'DCH, MD',
        rating: 4.7,
        fee: 400,
        availability: 'Mon - Sat',
        status: 'online',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
        experience: '14 years',
        about: 'Pediatrician.',
        location: 'Raiganj, West Bengal',
        phone: '+913523242222'
      }
    ]);

  const recordCount = await db.medicalRecords.count();
  if (recordCount === 0) {
    await db.medicalRecords.bulkAdd([
      {
        title: 'Annual Health Checkup',
        type: 'Visit',
        date: '2024-01-15',
        doctorName: 'Michael Smith',
        description: 'Routine annual checkup. All vitals normal. Recommended vitamin D supplements.',
        notes: 'Follow up in 6 months.'
      },
      {
        title: 'Blood Test Report',
        type: 'Lab Report',
        date: '2024-02-10',
        doctorName: 'Apollo Diagnostics',
        description: 'Complete blood count and lipid profile.',
        notes: 'Cholesterol slightly high.'
      },
      {
        title: 'Flu Prescription',
        type: 'Prescription',
        date: '2023-11-20',
        doctorName: 'Emily Peterson',
        description: 'Medication for seasonal flu and cough.',
      },
      {
        title: 'Surgical Consultation',
        type: 'Visit',
        date: '2024-03-01',
        doctorName: 'Subrata Kumar Pramanik',
        description: 'Consultation for minor abdominal pain. Recommended ultrasound.',
        notes: 'Patient advised to fast before ultrasound.'
      },
      {
        title: 'Orthopaedic X-Ray',
        type: 'Lab Report',
        date: '2024-03-10',
        doctorName: 'Amitava Sarkar',
        description: 'X-ray of the right knee. No fractures detected.',
        notes: 'Mild inflammation observed.'
      }
    ]);
  }
}

export async function clearDatabase() {
  await db.userProfile.clear();
  await db.healthMetrics.clear();
  await db.appointments.clear();
  await db.medications.clear();
  await db.labReports.clear();
  await db.medicalRecords.clear();
  localStorage.removeItem('onboarded');
}
