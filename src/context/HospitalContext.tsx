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
import { auth, db, signInWithGoogle, logOut, onAuthStateChanged, User } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';

interface HospitalContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  demoUserEmail: string | null;
  isGoogleAuthModalOpen: boolean;
  setIsGoogleAuthModalOpen: (open: boolean) => void;
  isFirestoreConnected: boolean;
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

const LOCAL_STORAGE_KEY_AUTH = 'pulsesync_auth_v4';
const LOCAL_STORAGE_KEY_DISPATCHES = 'pulsesync_dispatches_v4';
const LOCAL_STORAGE_KEY_DOCTORS = 'pulsesync_doctors_v4';
const LOCAL_STORAGE_KEY_HOSPITALS = 'pulsesync_hospitals_v4';

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
      const savedRole = localStorage.getItem('pulsesync_role_v4');
      return (savedRole as UserRole) || 'management';
    } catch {
      return 'management';
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUserEmail, setDemoUserEmail] = useState<string | null>('admin@rivercity-sukkur.pk');
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

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
  const [activeHospitalId, setActiveHospitalId] = useState<string>('hosp-1');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync to local storage as secondary backup
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, String(isAuthenticated));
      localStorage.setItem('pulsesync_role_v4', userRole);
      localStorage.setItem(LOCAL_STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
      localStorage.setItem(LOCAL_STORAGE_KEY_DOCTORS, JSON.stringify(doctors));
      localStorage.setItem(LOCAL_STORAGE_KEY_DISPATCHES, JSON.stringify(dispatches));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }, [isAuthenticated, userRole, hospitals, doctors, dispatches]);

  // Real-time bidirectional Firestore synchronization
  useEffect(() => {
    let unsubscribeHospitals = () => {};
    let unsubscribeDoctors = () => {};
    let unsubscribeDispatches = () => {};
    let unsubscribeNotifications = () => {};

    try {
      // 1. Synchronize Hospitals with Firestore
      const hospCol = collection(db, 'hospitals');
      unsubscribeHospitals = onSnapshot(hospCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Hospital[] = [];
          snapshot.forEach((d) => list.push(d.data() as Hospital));
          setHospitals(list);
          setIsFirestoreConnected(true);
        } else {
          // Seed Firestore with initial hospitals if empty
          INITIAL_HOSPITALS.forEach(async (h) => {
            try {
              await setDoc(doc(db, 'hospitals', h.id), h);
            } catch (err) {
              console.warn('Firestore initial hospital seed notice:', err);
            }
          });
          setIsFirestoreConnected(true);
        }
      }, (err) => {
        console.warn('Firestore hospitals snapshot notice:', err.message);
      });

      // 2. Synchronize Doctors with Firestore
      const docCol = collection(db, 'doctors');
      unsubscribeDoctors = onSnapshot(docCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Doctor[] = [];
          snapshot.forEach((d) => list.push(d.data() as Doctor));
          setDoctors(list);
          setIsFirestoreConnected(true);
        } else {
          // Seed Firestore with initial doctors if empty
          INITIAL_DOCTORS.forEach(async (docItem) => {
            try {
              await setDoc(doc(db, 'doctors', docItem.id), docItem);
            } catch (err) {
              console.warn('Firestore initial doctor seed notice:', err);
            }
          });
        }
      }, (err) => {
        console.warn('Firestore doctors snapshot notice:', err.message);
      });

      // 3. Synchronize Dispatches with Firestore
      const dispCol = collection(db, 'dispatches');
      unsubscribeDispatches = onSnapshot(dispCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: PatientDispatch[] = [];
          snapshot.forEach((d) => list.push(d.data() as PatientDispatch));
          // Sort latest first
          list.sort((a, b) => b.updatedAt - a.updatedAt);
          setDispatches(list);
          setIsFirestoreConnected(true);
        } else {
          INITIAL_DISPATCHES.forEach(async (disp) => {
            try {
              await setDoc(doc(db, 'dispatches', disp.id), disp);
            } catch (err) {
              console.warn('Firestore initial dispatch seed notice:', err);
            }
          });
        }
      }, (err) => {
        console.warn('Firestore dispatches snapshot notice:', err.message);
      });

      // 4. Synchronize Emergency Notifications with Firestore
      const notifCol = collection(db, 'notifications');
      unsubscribeNotifications = onSnapshot(notifCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: EmergencyNotification[] = [];
          snapshot.forEach((d) => list.push(d.data() as EmergencyNotification));
          list.sort((a, b) => b.timestamp - a.timestamp);
          setNotifications(list);
          setIsFirestoreConnected(true);
        }
      }, (err) => {
        console.warn('Firestore notifications snapshot notice:', err.message);
      });

    } catch (err) {
      console.warn('Firestore initialization notice:', err);
    }

    return () => {
      unsubscribeHospitals();
      unsubscribeDoctors();
      unsubscribeDispatches();
      unsubscribeNotifications();
    };
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setDemoUserEmail(user.email);
        setIsAuthenticated(true);
      }
    });
    return () => unsub();
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
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

    // Auto-detect admin credentials
    if ((cleanUser === 'admin' && cleanPass === 'admin') || (role === 'management' && cleanPass === 'admin')) {
      setUserRole('management');
      setActiveHospitalId('hosp-1');
      setDemoUserEmail('admin@rivercity-sukkur.pk');
      setIsAuthenticated(true);
      soundEffects.playSuccessTone();
      return { success: true };
    }

    // Auto-detect doctor credentials
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

  const markNotificationAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.warn('Firestore update notification notice:', e);
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const broadcastHospitalAlert = useCallback(async (
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

    // Save to Firestore
    try {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (e) {
      console.warn('Firestore save notification notice:', e);
    }

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
      distanceKm: Number(dist.toFixed(1)),
      notes: data.notes,
      timestamp: Date.now(),
      updatedAt: Date.now(),
      doctorAcknowledged: false,
      hospitalBedReserved: true,
    };

    setDispatches((prev) => [newDispatch, ...prev]);

    // Save to Firestore
    setDoc(doc(db, 'dispatches', newDispatch.id), newDispatch).catch((err) => {
      console.warn('Firestore save dispatch notice:', err);
    });

    // Notify Hospital & Doctor
    broadcastHospitalAlert(
      `INBOUND INTAKE: ${targetHospital.name}`,
      `${newDispatch.ambulanceCallsign} inbound with ${newDispatch.patientName} (${newDispatch.condition}). Reserved ${newDispatch.requiredRoom}. ETA: ${eta} mins.`,
      newDispatch.esiLevel === 1 ? 'critical' : 'high',
      targetHospital.id
    );

    return newDispatch;
  }, [hospitals, doctors, selectedAmbulanceId, broadcastHospitalAlert]);

  const requestEmergencyPickup = useCallback((data: {
    citizenName: string;
    contactNumber: string;
    locationInSukkur: string;
    condition: EmergencyCondition;
    notes: string;
  }): PatientDispatch => {
    const lat = 27.7052 + (Math.random() - 0.5) * 0.02;
    const lng = 68.8574 + (Math.random() - 0.5) * 0.02;
    const flagship = hospitals[0] || INITIAL_HOSPITALS[0];

    const newDispatch: PatientDispatch = {
      id: `pickup-${Date.now().toString().slice(-4)}`,
      ambulanceId: 'RESCUE-1122-SK04',
      ambulanceCallsign: 'Sindh Rescue 1122 (Unit 04 Sukkur)',
      driverName: 'Lead EMT Jamil / EMT Rasheed',
      patientName: data.citizenName,
      age: 45,
      gender: 'M',
      condition: data.condition,
      esiLevel: 1,
      requiredRoom: data.condition.includes('Cardiac') ? 'Cath Lab' : 'Trauma Bay',
      requiredSpecialty: data.condition.includes('Cardiac') ? 'Cardiology / Cath Lab' : 'Trauma Surgery',
      vitals: {
        heartRate: 110,
        bloodPressureSystolic: 95,
        bloodPressureDiastolic: 60,
        oxygenSaturation: 92,
        respiratoryRate: 22,
        gcs: 14,
        temperatureC: 36.8,
      },
      targetHospitalId: flagship.id,
      status: 'en_route_scene',
      currentLat: 27.7120,
      currentLng: 68.8450,
      destinationLat: lat,
      destinationLng: lng,
      etaMinutes: 7,
      distanceKm: 3.2,
      notes: `Citizen Request from ${data.locationInSukkur}. Phone: ${data.contactNumber}. Symptoms: ${data.notes}`,
      timestamp: Date.now(),
      updatedAt: Date.now(),
      doctorAcknowledged: false,
      hospitalBedReserved: true,
    };

    setDispatches((prev) => [newDispatch, ...prev]);

    // Save to Firestore
    setDoc(doc(db, 'dispatches', newDispatch.id), newDispatch).catch((err) => {
      console.warn('Firestore save pickup notice:', err);
    });

    broadcastHospitalAlert(
      'CITIZEN EMERGENCY PICKUP REQUESTED',
      `Rescue 1122 dispatched to ${data.locationInSukkur} for ${data.citizenName}. River City Hospital Sukkur prepped.`,
      'critical',
      flagship.id
    );

    return newDispatch;
  }, [hospitals, broadcastHospitalAlert]);

  const updateDispatchStatus = useCallback(async (dispatchId: string, newStatus: DispatchStatus) => {
    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id === dispatchId) {
          const updated = { 
            ...d, 
            status: newStatus, 
            updatedAt: Date.now(),
            etaMinutes: newStatus === 'arrived_hospital' ? 0 : d.etaMinutes
          };
          return updated;
        }
        return d;
      })
    );

    // Save to Firestore
    try {
      await updateDoc(doc(db, 'dispatches', dispatchId), {
        status: newStatus,
        updatedAt: Date.now(),
        ...(newStatus === 'arrived_hospital' ? { etaMinutes: 0 } : {}),
      });
    } catch (e) {
      console.warn('Firestore update dispatch status notice:', e);
    }

    soundEffects.playStatusUpdateTone();
  }, []);

  const updateDoctorStatus = useCallback(async (
    doctorId: string, 
    status: DoctorStatus, 
    availableUntil?: string, 
    note?: string
  ) => {
    setDoctors((prev) =>
      prev.map((docItem) => {
        if (docItem.id === doctorId) {
          return {
            ...docItem,
            status,
            availableUntil: availableUntil !== undefined ? availableUntil : docItem.availableUntil,
            note: note !== undefined ? note : docItem.note,
          };
        }
        return docItem;
      })
    );

    // Save to Firestore
    try {
      await updateDoc(doc(db, 'doctors', doctorId), {
        status,
        ...(availableUntil ? { availableUntil } : {}),
        ...(note !== undefined ? { note } : {}),
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Firestore update doctor notice:', e);
    }

    soundEffects.playStatusUpdateTone();
  }, []);

  const updateHospitalAssets = useCallback(async (
    hospitalId: string, 
    partialAssets: Partial<Hospital['assets']>, 
    divertStatus?: boolean
  ) => {
    let updatedHosp: Hospital | undefined;
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          updatedHosp = {
            ...h,
            assets: { ...h.assets, ...partialAssets },
            divertStatus: divertStatus !== undefined ? divertStatus : h.divertStatus,
          };
          return updatedHosp;
        }
        return h;
      })
    );

    // Save to Firestore
    if (updatedHosp) {
      try {
        await setDoc(doc(db, 'hospitals', hospitalId), updatedHosp, { merge: true });
      } catch (e) {
        console.warn('Firestore update hospital assets notice:', e);
      }
    }

    soundEffects.playStatusUpdateTone();
  }, []);

  const acknowledgePatientByDoctor = useCallback(async (dispatchId: string, doctorId: string) => {
    setDispatches((prev) =>
      prev.map((d) => (d.id === dispatchId ? { ...d, doctorAcknowledged: true, assignedDoctorId: doctorId, updatedAt: Date.now() } : d))
    );

    // Save to Firestore
    try {
      await updateDoc(doc(db, 'dispatches', dispatchId), {
        doctorAcknowledged: true,
        assignedDoctorId: doctorId,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Firestore doctor acknowledge notice:', e);
    }

    const docObj = doctors.find((d) => d.id === doctorId);
    broadcastHospitalAlert(
      'DOCTOR ACKNOWLEDGED PATIENT',
      `${docObj ? docObj.name : 'Specialist'} has acknowledged intake #${dispatchId.slice(-4)} and is awaiting arrival.`,
      'high'
    );
  }, [doctors, broadcastHospitalAlert]);

  const moveAmbulanceTowardsTarget = useCallback(async (dispatchId: string) => {
    let nextLat = 0;
    let nextLng = 0;
    let nextEta = 0;
    let nextDist = 0;

    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id === dispatchId && d.destinationLat && d.destinationLng) {
          const deltaLat = (d.destinationLat - d.currentLat) * 0.35;
          const deltaLng = (d.destinationLng - d.currentLng) * 0.35;
          nextLat = d.currentLat + deltaLat;
          nextLng = d.currentLng + deltaLng;
          nextDist = Number(calculateDistanceKm(nextLat, nextLng, d.destinationLat, d.destinationLng).toFixed(1));
          nextEta = estimateEmergencyEta(nextDist);

          return {
            ...d,
            currentLat: nextLat,
            currentLng: nextLng,
            distanceKm: nextDist,
            etaMinutes: nextEta,
            updatedAt: Date.now(),
          };
        }
        return d;
      })
    );

    // Save updated GPS location to Firestore
    if (nextLat && nextLng) {
      try {
        await updateDoc(doc(db, 'dispatches', dispatchId), {
          currentLat: nextLat,
          currentLng: nextLng,
          distanceKm: nextDist,
          etaMinutes: nextEta,
          updatedAt: Date.now(),
        });
      } catch (e) {
        console.warn('Firestore GPS update notice:', e);
      }
    }
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
        isFirestoreConnected,
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
