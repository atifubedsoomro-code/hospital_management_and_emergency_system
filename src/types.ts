export type UserRole = 'management' | 'ambulance' | 'doctor' | 'customer';

export type DoctorStatus = 'available' | 'in_surgery' | 'on_break' | 'off_duty' | 'emergency_call';

export type Specialty = 
  | 'Trauma Surgery'
  | 'Cardiology / Cath Lab'
  | 'Neurology / Stroke'
  | 'Emergency Medicine'
  | 'Pulmonology / ICU'
  | 'Pediatric Emergency'
  | 'Orthopedic Surgery';

export interface Doctor {
  id: string;
  name: string;
  avatar: string;
  specialty: Specialty;
  hospitalId: string;
  status: DoctorStatus;
  shiftStart: string;
  shiftEnd: string;
  phone: string;
  currentRoom?: string;
  activePatientId?: string;
  availableUntil: string;
  note?: string;
}

export type RoomType = 'ICU' | 'Trauma Bay' | 'Cath Lab' | 'Operating Theater' | 'Isolation' | 'General ER';

export interface HospitalAsset {
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
  traumaBaysTotal: number;
  traumaBaysAvailable: number;
  cathLabAvailable: boolean;
  ventilatorsAvailable: number;
  bloodUnitsO_Neg: number;
}

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  address: string;
  latitude: number;
  longitude: number;
  level: string;
  assets: HospitalAsset;
  contactNumber: string;
  divertStatus: boolean;
  activeDoctorsCount?: number;
}

export type EmergencyCondition = 
  | 'Cardiac Arrest / STEMI'
  | 'Severe Trauma / Hemorrhage'
  | 'Acute Stroke / CVA'
  | 'Respiratory Failure / ARDS'
  | 'Sepsis / Septic Shock'
  | 'Pediatric Severe Distress'
  | 'Multiple Fracture / Ortho Trauma'
  | 'General Critical';

export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export interface PatientVitals {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  gcs: number;
  temperatureC: number;
}

export type DispatchStatus = 
  | 'en_route_scene'
  | 'on_scene'
  | 'transporting'
  | 'arrived_hospital'
  | 'handover_completed';

export interface PatientDispatch {
  id: string;
  ambulanceId: string;
  ambulanceCallsign: string;
  driverName: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  condition: EmergencyCondition;
  esiLevel: EsiLevel;
  requiredRoom: RoomType;
  requiredSpecialty: Specialty;
  vitals: PatientVitals;
  targetHospitalId?: string;
  assignedDoctorId?: string;
  status: DispatchStatus;
  currentLat: number;
  currentLng: number;
  destinationLat?: number;
  destinationLng?: number;
  etaMinutes: number;
  distanceKm: number;
  notes: string;
  timestamp: number;
  updatedAt: number;
  doctorAcknowledged: boolean;
  hospitalBedReserved: boolean;
}

export interface EmergencyNotification {
  id: string;
  type: 'emergency_intake' | 'status_change' | 'hospital_alert' | 'critical_vitals' | 'doctor_ready';
  title: string;
  message: string;
  urgency: 'critical' | 'high' | 'normal';
  timestamp: number;
  read: boolean;
  targetRole?: UserRole | 'all';
  hospitalId?: string;
  dispatchId?: string;
}

export interface AlgorithmHospitalScore {
  hospital: Hospital;
  score: number;
  distanceKm: number;
  etaMinutes: number;
  roomAvailable: boolean;
  availableRoomCount: number;
  availableDoctors: Doctor[];
  hasSpecialist: boolean;
  recommendationReason: string;
  isEligible: boolean;
}
