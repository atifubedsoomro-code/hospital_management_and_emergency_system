import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  Hospital, 
  Doctor, 
  PatientDispatch, 
  EmergencyNotification, 
  DoctorStatus,
  DispatchStatus,
  RoomType,
  Specialty,
  EmergencyCondition,
  PatientVitals
} from '../types';
import { 
  INITIAL_HOSPITALS, 
  INITIAL_DOCTORS, 
  INITIAL_DISPATCHES, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockInitialData';
import { soundEffects } from '../services/soundEffects';
import { calculateDistanceKm, estimateEmergencyEta, evaluateHospitals } from '../services/routingAlgorithm';
import { auth, signInWithGoogle, logOut, onAuthStateChanged, User } from '../firebase';

interface HospitalContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  demoUserEmail: string | null;
  isGoogleAuthModalOpen: boolean;
  setIsGoogleAuthModalOpen: (open: boolean) => void;
  hospitals: Hospital[];
  doctors: Doctor[];
  dispatches: PatientDispatch[];
  notifications: EmergencyNotification[];
  selectedDoctorId: string;
  setSelectedDoctorId: (id: string) => void;
  selectedAmbulanceId: string;
  setSelectedAmbulanceId: (id: string) => void;
  activeHospitalId: string;
  setActiveHospitalId: (id: string) => void;
  isMuted: boolean;
  toggleMute: () => void;
  
  // Authentication Actions
  loginAsGuest: (role: 'ambulance' | 'customer') => void;
  loginWithCredentials: (role: 'doctor' | 'management', username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  handleGoogleSignIn: (role?: UserRole) => Promise<void>;
  
  // Clinical & Dispatch Actions
  submitPatientIntake: (data: {
    patientName: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    condition: EmergencyCondition;
    esiLevel: 1 | 2 | 3 | 4 | 5;
    requiredRoom: RoomType;
    requiredSpecialty: Specialty;
    vitals: PatientVitals;
    notes: string;
    targetHospitalId?: string;
  }) => PatientDispatch;
  
  requestEmergencyPickup: (data: {
    citizenName: string;
    contactNumber: string;
    locationInSukkur: string;
    condition: EmergencyCondition;
    notes: string;
  }) => PatientDispatch;

  updateDispatchStatus: (dispatchId: string, newStatus: DispatchStatus) => void;
  updateDoctorStatus: (doctorId: string, status: DoctorStatus, availableUntil?: string, note?: string) => void;
  updateHospitalAssets: (hospitalId: string, partialAssets: Partial<Hospital['assets']>, divertStatus?: boolean) => void;
  acknowledgePatientByDoctor: (dispatchId: string, doctorId: string) => void;
  broadcastHospitalAlert: (title: string, message: string, urgency: 'critical' | 'high' | 'normal', hospitalId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  moveAmbulanceTowardsTarget: (dispatchId: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_AUTH = 'pulsesync_auth_v3';
const LOCAL_STORAGE_KEY_DISPATCHES = 'pulsesync_dispatches_v3';
const LOCAL_STORAGE_KEY_DOCTORS = 'pulsesync_doctors_v3';
const LOCAL_STORAGE_KEY_HOSPITALS = 'pulsesync_hospitals_v3';

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('pulsesync_role_v3');
      return (savedRole as UserRole) || 'management';
    } catch {
      return 'management';
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUserEmail, setDemoUserEmail] = useState<string | null>('admin@rivercity-sukkur.pk');
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);

  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HOSPITALS);
      return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
    } catch {
      return INITIAL_HOSPITALS;
    }
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DOCTORS);
      return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
    } catch {
      return INITIAL_DOCTORS;
    }
  });

  const [dispatches, setDispatches] = useState<PatientDispatch[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DISPATCHES);
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [notifications, setNotifications] = useState<EmergencyNotification[]>(INITIAL_NOTIFICATIONS);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-1');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>('RESCUE-1122-SK04');
  const [activeHospitalId, setActiveHospitalId] = useState<string>('hosp-1'); // River City Hospital Sukkur
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setDemoUserEmail(user.email);
        setIsAuthenticated(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, String(isAuthenticated));
      localStorage.setItem('pulsesync_role_v3', userRole);
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [hospitals]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DOCTORS, JSON.stringify(doctors));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [doctors]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DISPATCHES, JSON.stringify(dispatches));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [dispatches]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  const loginAsGuest = (role: 'ambulance' | 'customer') => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'ambulance') {
      setDemoUserEmail('rescue1122.sukkur@sindh.gov.pk');
      setSelectedAmbulanceId('RESCUE-1122-SK04');
    } else {
      setDemoUserEmail('citizen.sukkur@emergency.pk');
    }
    soundEffects.playSuccessTone();
  };

  const loginWithCredentials = (role: 'doctor' | 'management', username: string, pass: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Auto-detect admin credentials even if doctor tab was highlighted
    if ((cleanUser === 'admin' && cleanPass === 'admin') || (role === 'management' && cleanPass === 'admin')) {
      setUserRole('management');
      setActiveHospitalId('hosp-1');
      setDemoUserEmail('admin@rivercity-sukkur.pk');
      setIsAuthenticated(true);
      soundEffects.playSuccessTone();
      return { success: true };
    }

    // Auto-detect doctor credentials even if management tab was highlighted
    if ((cleanUser === 'doctor' && cleanPass === 'doctor') || (role === 'doctor' && cleanPass === 'doctor')) {
      setUserRole('doctor');
      setSelectedDoctorId('doc-1');
      setDemoUserEmail('dr.tariq.soomro@rivercity-sukkur.pk');
      setIsAuthenticated(true);
      soundEffects.playSuccessTone();
      return { success: true };
    }

    if (role === 'doctor') {
      return { 
        success: false, 
        error: 'Invalid Doctor credentials. Please enter Username: doctor and Password: doctor' 
      };
    }

    if (role === 'management') {
      return { 
        success: false, 
        error: 'Invalid Management credentials. Please enter Username: admin and Password: admin' 
      };
    }

    return { 
      success: false, 
      error: 'Invalid credentials. For Doctor use doctor / doctor, for Management use admin / admin.' 
    };
  };

  const logout = async () => {
    await logOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
    soundEffects.playSuccessTone();
  };

  const handleGoogleSignIn = async (role?: UserRole) => {
    const res = await signInWithGoogle();
    if (res.user) {
      setCurrentUser(res.user);
      setDemoUserEmail(res.user.email);
      if (role) {
        setUserRole(role);
      }
      setIsAuthenticated(true);
      setIsGoogleAuthModalOpen(false);
      soundEffects.playSuccessTone();
    }
  };

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const broadcastHospitalAlert = useCallback((
    title: string, 
    message: string, 
    urgency: 'critical' | 'high' | 'normal', 
    hospitalId?: string
  ) => {
    const newNotif: EmergencyNotification = {
      id: `alert-${Date.now()}`,
      type: 'hospital_alert',
      title,
      message,
      urgency,
      timestamp: Date.now(),
      read: false,
      hospitalId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    if (urgency === 'critical') {
      soundEffects.playEmergencyAlert();
    } else {
      soundEffects.playPagerChime();
    }
  }, []);

  const submitPatientIntake = useCallback((data: {
    patientName: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    condition: EmergencyCondition;
    esiLevel: 1 | 2 | 3 | 4 | 5;
    requiredRoom: RoomType;
    requiredSpecialty: Specialty;
    vitals: PatientVitals;
    notes: string;
    targetHospitalId?: string;
  }): PatientDispatch => {
    const currentLat = 27.7050 + (Math.random() - 0.5) * 0.03;
    const currentLng = 68.8570 + (Math.random() - 0.5) * 0.03;

    let targetHospital = hospitals.find((h) => h.id === data.targetHospitalId);
    let assignedDoc: Doctor | undefined;

    if (!targetHospital) {
      const scored = evaluateHospitals(
        currentLat,
        currentLng,
        data.requiredRoom,
        data.requiredSpecialty,
        hospitals,
        doctors
      );
      if (scored.length > 0) {
        targetHospital = scored[0].hospital;
        assignedDoc = scored[0].availableDoctors[0];
      }
    }

    if (!targetHospital) {
      targetHospital = hospitals[0]; // River City Hospital Sukkur
    }

    if (!assignedDoc) {
      assignedDoc = doctors.find(
        (d) => d.hospitalId === targetHospital!.id && d.status === 'available'
      ) || doctors[0];
    }

    const dist = calculateDistanceKm(currentLat, currentLng, targetHospital.latitude, targetHospital.longitude);
    const eta = estimateEmergencyEta(dist);

    const newDispatch: PatientDispatch = {
      id: `disp-${Date.now().toString().slice(-4)}`,
      ambulanceId: selectedAmbulanceId,
      ambulanceCallsign: selectedAmbulanceId.includes('1122') ? 'Sindh Rescue 1122 (Sukkur)' : selectedAmbulanceId,
      driverName: 'Emergency Paramedic Team',
      patientName: data.patientName || 'Unknown Patient',
      age: data.age,
      gender: data.gender,
      condition: data.condition,
      esiLevel: data.esiLevel,
      requiredRoom: data.requiredRoom,
      requiredSpecialty: data.requiredSpecialty,
      vitals: data.vitals,
      targetHospitalId: targetHospital.id,
      assignedDoctorId: assignedDoc?.id,
      status: 'transporting',
      currentLat,
      currentLng,
      destinationLat: targetHospital.latitude,
      destinationLng: targetHospital.longitude,
      etaMinutes: eta,
      distanceKm: dist,
      notes: data.notes,
      timestamp: Date.now(),
      updatedAt: Date.now(),
      doctorAcknowledged: false,
      hospitalBedReserved: true,
    };

    setDispatches((prev) => [newDispatch, ...prev]);

    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === targetHospital!.id) {
          const updatedAssets = { ...h.assets };
          if (data.requiredRoom === 'ICU' && updatedAssets.icuAvailable > 0) {
            updatedAssets.icuAvailable -= 1;
          } else if (data.requiredRoom === 'Trauma Bay' && updatedAssets.traumaBaysAvailable > 0) {
            updatedAssets.traumaBaysAvailable -= 1;
          }
          if (updatedAssets.availableBeds > 0) {
            updatedAssets.availableBeds -= 1;
          }
          return { ...h, assets: updatedAssets };
        }
        return h;
      })
    );

    const notif: EmergencyNotification = {
      id: `notif-${Date.now()}`,
      type: 'emergency_intake',
      title: `EMERGENCY ADMISSION: ${targetHospital.name}`,
      message: `${data.condition} (ESI ${data.esiLevel}) - ETA: ${eta} mins to ${targetHospital.name}. Room and doctor reserved.`,
      urgency: data.esiLevel === 1 ? 'critical' : 'high',
      timestamp: Date.now(),
      read: false,
      hospitalId: targetHospital.id,
      dispatchId: newDispatch.id,
    };

    setNotifications((prev) => [notif, ...prev]);
    soundEffects.playEmergencyAlert();

    return newDispatch;
  }, [hospitals, doctors, selectedAmbulanceId]);

  const requestEmergencyPickup = useCallback((data: {
    citizenName: string;
    contactNumber: string;
    locationInSukkur: string;
    condition: EmergencyCondition;
    notes: string;
  }): PatientDispatch => {
    let requiredRoom: RoomType = 'General ER';
    let requiredSpecialty: Specialty = 'Emergency Medicine';

    if (data.condition === 'Cardiac Arrest / STEMI') {
      requiredRoom = 'Cath Lab';
      requiredSpecialty = 'Cardiology / Cath Lab';
    } else if (data.condition === 'Severe Trauma / Hemorrhage') {
      requiredRoom = 'Trauma Bay';
      requiredSpecialty = 'Trauma Surgery';
    } else if (data.condition === 'Acute Stroke / CVA') {
      requiredRoom = 'General ER';
      requiredSpecialty = 'Neurology / Stroke';
    } else if (data.condition === 'Respiratory Failure / ARDS') {
      requiredRoom = 'ICU';
      requiredSpecialty = 'Pulmonology / ICU';
    } else if (data.condition === 'Pediatric Severe Distress') {
      requiredRoom = 'General ER';
      requiredSpecialty = 'Pediatric Emergency';
    }

    const defaultVitals: PatientVitals = {
      heartRate: 110,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      oxygenSaturation: 94,
      respiratoryRate: 20,
      gcs: 14,
      temperatureC: 37.0,
    };

    const newDisp = submitPatientIntake({
      patientName: `${data.citizenName} (Ph: ${data.contactNumber})`,
      age: 40,
      gender: 'M',
      condition: data.condition,
      esiLevel: 1,
      requiredRoom,
      requiredSpecialty,
      vitals: defaultVitals,
      notes: `Location: ${data.locationInSukkur}. Caller Note: ${data.notes}`,
    });

    broadcastHospitalAlert(
      `CITIZEN EMERGENCY PICKUP: ${data.locationInSukkur}`,
      `${data.citizenName} (${data.contactNumber}) requested rapid ambulance dispatch in Sukkur. Response unit engaged.`,
      'critical'
    );

    return newDisp;
  }, [submitPatientIntake, broadcastHospitalAlert]);

  const updateDispatchStatus = useCallback((dispatchId: string, newStatus: DispatchStatus) => {
    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id === dispatchId) {
          const updated: PatientDispatch = {
            ...d,
            status: newStatus,
            updatedAt: Date.now(),
            etaMinutes: newStatus === 'arrived_hospital' || newStatus === 'handover_completed' ? 0 : d.etaMinutes,
          };

          let statusText = '';
          if (newStatus === 'transporting') statusText = 'En Route to Hospital';
          if (newStatus === 'arrived_hospital') statusText = 'Arrived at Emergency Bay - Handover Commenced';
          if (newStatus === 'handover_completed') statusText = 'Patient Successfully Admitted';

          const notif: EmergencyNotification = {
            id: `status-${Date.now()}`,
            type: 'status_change',
            title: `Ambulance Status: ${d.ambulanceCallsign}`,
            message: `${d.patientName} (${d.condition}) → ${statusText}.`,
            urgency: newStatus === 'arrived_hospital' ? 'critical' : 'normal',
            timestamp: Date.now(),
            read: false,
            hospitalId: d.targetHospitalId,
            dispatchId: d.id,
          };
          setNotifications((n) => [notif, ...n]);
          soundEffects.playPagerChime();

          return updated;
        }
        return d;
      })
    );
  }, []);

  const updateDoctorStatus = useCallback((
    doctorId: string, 
    status: DoctorStatus, 
    availableUntil?: string, 
    note?: string
  ) => {
    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          const updated: Doctor = {
            ...doc,
            status,
            availableUntil: availableUntil || doc.availableUntil,
            note: note !== undefined ? note : doc.note,
          };

          const notif: EmergencyNotification = {
            id: `doc-${Date.now()}`,
            type: 'doctor_ready',
            title: `Doctor Availability Updated: ${doc.name}`,
            message: `Status updated to [${status.toUpperCase()}]. Available until: ${updated.availableUntil}.`,
            urgency: status === 'available' ? 'normal' : 'high',
            timestamp: Date.now(),
            read: false,
            hospitalId: doc.hospitalId,
          };
          setNotifications((n) => [notif, ...n]);
          soundEffects.playSuccessTone();

          return updated;
        }
        return doc;
      })
    );
  }, []);

  const updateHospitalAssets = useCallback((
    hospitalId: string, 
    partialAssets: Partial<Hospital['assets']>, 
    divertStatus?: boolean
  ) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const updated = {
            ...h,
            assets: { ...h.assets, ...partialAssets },
            divertStatus: divertStatus !== undefined ? divertStatus : h.divertStatus,
          };

          if (divertStatus === true) {
            broadcastHospitalAlert(
              `HOSPITAL DIVERT ACTIVE: ${h.name}`,
              'Hospital is now on divert protocol. Incoming ambulances will be auto-rerouted to alternate facilities.',
              'critical',
              hospitalId
            );
          } else {
            soundEffects.playSuccessTone();
          }

          return updated;
        }
        return h;
      })
    );
  }, [broadcastHospitalAlert]);

  const acknowledgePatientByDoctor = useCallback((dispatchId: string, doctorId: string) => {
    setDispatches((prev) =>
      prev.map((d) => (d.id === dispatchId ? { ...d, doctorAcknowledged: true } : d))
    );

    const doc = doctors.find((d) => d.id === doctorId);
    const disp = dispatches.find((d) => d.id === dispatchId);

    if (doc && disp) {
      const notif: EmergencyNotification = {
        id: `ack-${Date.now()}`,
        type: 'doctor_ready',
        title: `Doctor Ready: ${doc.name}`,
        message: `${doc.name} confirmed ready for incoming patient ${disp.patientName}. Resuscitation room prepped.`,
        urgency: 'high',
        timestamp: Date.now(),
        read: false,
        hospitalId: disp.targetHospitalId,
        dispatchId: disp.id,
      };
      setNotifications((n) => [notif, ...n]);
      soundEffects.playSuccessTone();
    }
  }, [doctors, dispatches]);

  const moveAmbulanceTowardsTarget = useCallback((dispatchId: string) => {
    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id === dispatchId && d.destinationLat && d.destinationLng && d.status === 'transporting') {
          const stepRatio = 0.3;
          const nextLat = d.currentLat + (d.destinationLat - d.currentLat) * stepRatio;
          const nextLng = d.currentLng + (d.destinationLng - d.currentLng) * stepRatio;
          const nextDist = calculateDistanceKm(nextLat, nextLng, d.destinationLat, d.destinationLng);
          const nextEta = estimateEmergencyEta(nextDist);

          if (nextDist <= 0.3) {
            soundEffects.playEmergencyAlert();
            return {
              ...d,
              currentLat: d.destinationLat,
              currentLng: d.destinationLng,
              distanceKm: 0,
              etaMinutes: 0,
              status: 'arrived_hospital',
            };
          }

          return {
            ...d,
            currentLat: nextLat,
            currentLng: nextLng,
            distanceKm: nextDist,
            etaMinutes: nextEta,
          };
        }
        return d;
      })
    );
  }, []);

  return (
    <HospitalContext.Provider
      value={{
        userRole,
        setUserRole,
        isAuthenticated,
        currentUser,
        demoUserEmail,
        isGoogleAuthModalOpen,
        setIsGoogleAuthModalOpen,
        hospitals,
        doctors,
        dispatches,
        notifications,
        selectedDoctorId,
        setSelectedDoctorId,
        selectedAmbulanceId,
        setSelectedAmbulanceId,
        activeHospitalId,
        setActiveHospitalId,
        isMuted,
        toggleMute,
        loginAsGuest,
        loginWithCredentials,
        logout,
        handleGoogleSignIn,
        submitPatientIntake,
        requestEmergencyPickup,
        updateDispatchStatus,
        updateDoctorStatus,
        updateHospitalAssets,
        acknowledgePatientByDoctor,
        broadcastHospitalAlert,
        markNotificationAsRead,
        clearAllNotifications,
        moveAmbulanceTowardsTarget,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
