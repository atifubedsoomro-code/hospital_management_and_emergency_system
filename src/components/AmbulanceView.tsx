import React, { useState, useMemo } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalMap } from './HospitalMap';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { 
  EmergencyCondition, 
  EsiLevel, 
  RoomType, 
  Specialty, 
  PatientVitals,
  DispatchStatus
} from '../types';
import { evaluateHospitals } from '../services/routingAlgorithm';
import { 
  Ambulance, 
  Zap, 
  Navigation, 
  Heart, 
  ShieldAlert, 
  MapPin, 
  ArrowRight,
  Flame,
  Activity,
  Wind,
  Layers
} from 'lucide-react';

export const AmbulanceView: React.FC = () => {
  const { 
    hospitals, 
    doctors, 
    dispatches, 
    submitPatientIntake, 
    updateDispatchStatus,
    moveAmbulanceTowardsTarget,
    selectedAmbulanceId,
    setSelectedAmbulanceId,
    playClickTone,
    activeSection,
    setActiveSection
  } = useHospital();

  const [patientName, setPatientName] = useState<string>('Muhammad Rafiq Soomro');
  const [age, setAge] = useState<number>(54);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [condition, setCondition] = useState<EmergencyCondition>('Cardiac Arrest / STEMI');
  const [esiLevel, setEsiLevel] = useState<EsiLevel>(1);
  const [requiredRoom, setRequiredRoom] = useState<RoomType>('Cath Lab');
  const [requiredSpecialty, setRequiredSpecialty] = useState<Specialty>('Cardiology / Cath Lab');
  const [notes, setNotes] = useState<string>('Patient picked up near Sukkur Bypass with crushing chest pain. 12-lead ECG confirms acute STEMI.');

  const [heartRate, setHeartRate] = useState<number>(118);
  const [bpSystolic, setBpSystolic] = useState<number>(86);
  const [bpDiastolic, setBpDiastolic] = useState<number>(56);
  const [oxygenSaturation, setOxygenSaturation] = useState<number>(92);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(26);
  const [gcs, setGcs] = useState<number>(13);

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');

  const currentDispatch = useMemo(() => {
    return dispatches.find((d) => d.ambulanceId === selectedAmbulanceId && d.status !== 'handover_completed')
      || dispatches.find((d) => d.status !== 'handover_completed');
  }, [dispatches, selectedAmbulanceId]);

  const currentAmbLat = currentDispatch?.currentLat || 27.7052;
  const currentAmbLng = currentDispatch?.currentLng || 68.8574;

  const algorithmRecommendations = useMemo(() => {
    return evaluateHospitals(
      currentAmbLat,
      currentAmbLng,
      requiredRoom,
      requiredSpecialty,
      hospitals,
      doctors
    );
  }, [currentAmbLat, currentAmbLng, requiredRoom, requiredSpecialty, hospitals, doctors]);

  const handleSelectConditionPreset = (cond: EmergencyCondition) => {
    playClickTone();
    setCondition(cond);
    if (cond === 'Cardiac Arrest / STEMI') {
      setRequiredRoom('Cath Lab');
      setRequiredSpecialty('Cardiology / Cath Lab');
      setEsiLevel(1);
      setHeartRate(120);
      setBpSystolic(85);
      setBpDiastolic(55);
      setOxygenSaturation(92);
      setNotes('Severe crushing chest pain radiating to left arm. ST elevation in anterior leads. Aspirin given.');
    } else if (cond === 'Severe Trauma / Hemorrhage') {
      setRequiredRoom('Trauma Bay');
      setRequiredSpecialty('Trauma Surgery');
      setEsiLevel(1);
      setHeartRate(135);
      setBpSystolic(82);
      setBpDiastolic(50);
      setOxygenSaturation(94);
      setNotes('High-speed highway collision on Sukkur Bypass. Active arterial hemorrhage with pelvic trauma.');
    } else if (cond === 'Acute Stroke / CVA') {
      setRequiredRoom('General ER');
      setRequiredSpecialty('Neurology / Stroke');
      setEsiLevel(2);
      setHeartRate(88);
      setBpSystolic(165);
      setBpDiastolic(105);
      setOxygenSaturation(97);
      setNotes('Sudden right-sided hemiplegia and expressive aphasia. Last known well: 40 minutes ago.');
    } else if (cond === 'Respiratory Failure / ARDS') {
      setRequiredRoom('ICU');
      setRequiredSpecialty('Pulmonology / ICU');
      setEsiLevel(1);
      setHeartRate(128);
      setBpSystolic(110);
      setBpDiastolic(70);
      setOxygenSaturation(81);
      setRespiratoryRate(34);
      setNotes('Severe bronchospasm, profound cyanosis, failing non-invasive ventilation.');
    } else if (cond === 'Pediatric Severe Distress') {
      setRequiredRoom('General ER');
      setRequiredSpecialty('Pediatric Emergency');
      setEsiLevel(1);
      setAge(4);
      setHeartRate(165);
      setBpSystolic(75);
      setBpDiastolic(45);
      setOxygenSaturation(89);
      setNotes('Pediatric patient with severe stridor, lethargic, rapid respiratory deterioration.');
    }
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickTone();

    const vitals: PatientVitals = {
      heartRate,
      bloodPressureSystolic: bpSystolic,
      bloodPressureDiastolic: bpDiastolic,
      oxygenSaturation,
      respiratoryRate,
      gcs,
      temperatureC: 36.5,
    };

    const targetHospId = selectedHospitalId || (algorithmRecommendations[0] ? algorithmRecommendations[0].hospital.id : hospitals[0].id);

    submitPatientIntake({
      patientName,
      age,
      gender,
      condition,
      esiLevel,
      requiredRoom,
      requiredSpecialty,
      vitals,
      notes,
      targetHospitalId: targetHospId,
    });

    setActiveSection('transit');
  };

  const handleNextStatus = (currentStatus: DispatchStatus) => {
    playClickTone();
    if (!currentDispatch) return;
    const flow: DispatchStatus[] = ['en_route_scene', 'on_scene', 'transporting', 'arrived_hospital', 'handover_completed'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < flow.length - 1) {
      updateDispatchStatus(currentDispatch.id, flow[currentIndex + 1]);
    }
  };

  const shouldShow = (sectionKey: string) => {
    return activeSection === 'all' || activeSection === sectionKey;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      {/* Top Cockpit Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <HospitalLogoFrame size="md" withGlow={true} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">AMBULANCE COCKPIT</h2>
              <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-black px-1.5 py-0.5 rounded">
                Sukkur Unit
              </span>
            </div>
            <p className="text-xs text-zinc-400">Unit ID: <span className="font-mono text-white font-bold">{selectedAmbulanceId}</span> · GPS Active</p>
          </div>
        </div>

        {/* Unit Selector & Fast View Switch */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedAmbulanceId}
            onChange={(e) => {
              playClickTone();
              setSelectedAmbulanceId(e.target.value);
            }}
            className="bg-black border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="RESCUE-1122-SK04">Sindh Rescue 1122 (Unit 04 Sukkur)</option>
            <option value="EDHI-115-SK09">Edhi Ambulance (Unit 115 Sukkur)</option>
            <option value="CHHIPA-1020-SK12">Chhipa Ambulance (Unit 1020 Sukkur)</option>
          </select>

          {activeSection !== 'all' && (
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setActiveSection('all');
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>All</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: Active Transit Card (When 'transit', 'all', or when active transit exists) */}
      {(shouldShow('transit') || (activeSection === 'all' && currentDispatch)) && currentDispatch && (
        <div className="bg-zinc-950 border border-red-600/60 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden neon-card-glow space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">ACTIVE EMERGENCY TRANSIT</span>
              <h3 className="text-lg sm:text-xl font-black text-white">{currentDispatch.patientName}, {currentDispatch.age}y ({currentDispatch.gender})</h3>
              <p className="text-xs text-zinc-300 font-semibold">{currentDispatch.condition}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-mono">ESTIMATED TRANSIT</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-red-500">{currentDispatch.etaMinutes} MINS</span>
                <span className="text-[11px] text-zinc-400 block font-mono">{currentDispatch.distanceKm} km to door</span>
              </div>
              <div className="px-3 py-2 rounded-2xl bg-red-600 text-white font-black text-sm uppercase shadow-md">
                ESI {currentDispatch.esiLevel}
              </div>
            </div>
          </div>

          {/* Destination & Specialist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-black p-3 sm:p-3.5 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Destination Facility</span>
                <span className="text-[10px] font-mono text-white bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded">
                  Room: {currentDispatch.requiredRoom}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                {hospitals.find((h) => h.id === currentDispatch.targetHospitalId)?.name || 'River City Hospital Sukkur'}
              </h4>
              <p className="text-xs text-zinc-400">
                {hospitals.find((h) => h.id === currentDispatch.targetHospitalId)?.address}
              </p>
            </div>

            <div className="bg-black p-3 sm:p-3.5 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Assigned Specialist</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  currentDispatch.doctorAcknowledged 
                    ? 'bg-red-950 text-red-300 border border-red-700' 
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                }`}>
                  {currentDispatch.doctorAcknowledged ? 'Ready on floor' : 'Standby'}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                {doctors.find((d) => d.id === currentDispatch.assignedDoctorId)?.name || 'On-Call Emergency Staff'}
              </h4>
              <p className="text-xs text-zinc-400">
                {doctors.find((d) => d.id === currentDispatch.assignedDoctorId)?.specialty || currentDispatch.requiredSpecialty}
              </p>
            </div>
          </div>

          {/* Vitals strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-2 font-mono text-center text-xs">
            <div className="bg-black p-2 rounded-xl border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block uppercase">HR</span>
              <span className="font-bold text-red-500">{currentDispatch.vitals.heartRate} bpm</span>
            </div>
            <div className="bg-black p-2 rounded-xl border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block uppercase">BP</span>
              <span className="font-bold text-white">
                {currentDispatch.vitals.bloodPressureSystolic}/{currentDispatch.vitals.bloodPressureDiastolic}
              </span>
            </div>
            <div className="bg-black p-2 rounded-xl border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block uppercase">SpO2</span>
              <span className="font-bold text-white">{currentDispatch.vitals.oxygenSaturation}%</span>
            </div>
            <div className="bg-black p-2 rounded-xl border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block uppercase">RR</span>
              <span className="font-bold text-zinc-300">{currentDispatch.vitals.respiratoryRate}/m</span>
            </div>
            <div className="bg-black p-2 rounded-xl border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block uppercase">GCS</span>
              <span className="font-bold text-white">{currentDispatch.vitals.gcs}</span>
            </div>
            <div className="bg-black p-2 rounded-xl border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block uppercase">Temp</span>
              <span className="font-bold text-zinc-200">{currentDispatch.vitals.temperatureC}°C</span>
            </div>
          </div>

          {/* Tactical actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                playClickTone();
                moveAmbulanceTowardsTarget(currentDispatch.id);
              }}
              className="bg-white hover:bg-zinc-200 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer uppercase btn-neon-white"
            >
              <Navigation className="w-4 h-4 text-red-600" />
              <span>Drive Closer (Update GPS)</span>
            </button>

            <button
              type="button"
              onClick={() => handleNextStatus(currentDispatch.status)}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg uppercase tracking-wide flex items-center gap-2 transition-all active:scale-95 cursor-pointer btn-neon-red"
            >
              <span>Advance: {currentDispatch.status.replace(/_/g, ' ')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: Rapid Patient Intake Form */}
      {shouldShow('intake') && (
        <form onSubmit={handleIntakeSubmit} className="space-y-5">
          {/* Quick Condition Presets */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-lg">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
              1-Tap Critical Emergency Presets (Acuity Protocols)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Cardiac STEMI', icon: Heart, cond: 'Cardiac Arrest / STEMI' },
                { label: 'Severe Trauma', icon: Activity, cond: 'Severe Trauma / Hemorrhage' },
                { label: 'Acute Stroke', icon: Zap, cond: 'Acute Stroke / CVA' },
                { label: 'Respiratory ARDS', icon: Wind, cond: 'Respiratory Failure / ARDS' },
                { label: 'Pediatric Code', icon: Flame, cond: 'Pediatric Severe Distress' },
                { label: 'Sepsis Shock', icon: ShieldAlert, cond: 'Sepsis / Septic Shock' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectConditionPreset(item.cond as EmergencyCondition)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                      condition === item.cond
                        ? 'bg-red-950 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demographics & Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Patient Demographics & Acuity
              </span>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Patient Name or Identifier</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
                    placeholder="e.g. Muhammad Rafiq Soomro"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClickTone();
                      setPatientName(`Trauma Case #${Math.floor(100 + Math.random() * 900)}`);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl text-xs font-bold border border-zinc-700 whitespace-nowrap cursor-pointer"
                  >
                    Unknown
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                    min={1}
                    max={110}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Emergency Severity Index (ESI Level 1-5)</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as EsiLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        playClickTone();
                        setEsiLevel(lvl);
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        esiLevel === lvl
                          ? 'bg-red-600 border-red-500 text-white shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      L{lvl} {lvl === 1 ? 'STAT' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Required Room Type</label>
                  <select
                    value={requiredRoom}
                    onChange={(e) => setRequiredRoom(e.target.value as RoomType)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
                  >
                    <option value="Cath Lab">Cath Lab</option>
                    <option value="Trauma Bay">Trauma Bay</option>
                    <option value="ICU">ICU</option>
                    <option value="Operating Theater">Operating Theater</option>
                    <option value="General ER">General ER</option>
                    <option value="Isolation">Isolation</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Required Specialist</label>
                  <select
                    value={requiredSpecialty}
                    onChange={(e) => setRequiredSpecialty(e.target.value as Specialty)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
                  >
                    <option value="Cardiology / Cath Lab">Cardiologist (NICVD / Cath Lab)</option>
                    <option value="Trauma Surgery">Trauma Surgeon</option>
                    <option value="Neurology / Stroke">Neurologist / Stroke</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Pulmonology / ICU">Pulmonologist / ICU</option>
                    <option value="Pediatric Emergency">Pediatric Specialist</option>
                    <option value="Orthopedic Surgery">Orthopedic Surgeon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vitals Inputs */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Immediate Vitals Telemetry
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-red-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">BP Systolic</label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">BP Diastolic</label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">GCS Scale (3-15)</label>
                  <input
                    type="number"
                    min={3}
                    max={15}
                    value={gcs}
                    onChange={(e) => setGcs(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Paramedic Clinical Field Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="Clinical notes, medications given, airway status..."
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base py-4 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.7)] flex items-center justify-center gap-2 tracking-wide uppercase transition-all active:scale-[0.99] cursor-pointer btn-neon-red"
            >
              <Zap className="w-5 h-5 text-white" />
              <span>Initiate Emergency Dispatch & Alert Hospital</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 3: Tactical Emergency Route Map */}
      {shouldShow('map') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Sukkur Emergency Fast Path Tactical Map</span>
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">
              Target: {currentDispatch?.requiredRoom || requiredRoom}
            </span>
          </div>
          <HospitalMap
            hospitals={hospitals}
            dispatches={dispatches}
            selectedDispatchId={currentDispatch?.id}
            heightClass="h-[340px] sm:h-[420px]"
          />
        </div>
      )}

      {/* SECTION 4: Hospital Routing Algorithm */}
      {shouldShow('ranking') && (
        <div className="bg-zinc-950 border border-red-600/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                Facility Routing Algorithm (Sukkur Network)
              </h3>
            </div>
            <span className="text-xs font-mono text-red-400">
              Proximity + {requiredRoom} + On-Duty Specialists
            </span>
          </div>

          <div className="space-y-3">
            {algorithmRecommendations.map((rec, idx) => {
              const isTop = idx === 0;
              const isSelected = selectedHospitalId === rec.hospital.id || (!selectedHospitalId && isTop);

              return (
                <div
                  key={rec.hospital.id}
                  onClick={() => {
                    playClickTone();
                    setSelectedHospitalId(rec.hospital.id);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-red-500 shadow-xl shadow-red-950/40 ring-1 ring-red-500'
                      : 'bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isTop ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          {rec.hospital.name}
                          {isTop && (
                            <span className="text-[10px] font-mono text-red-400 border border-red-900 bg-red-950 px-1.5 py-0.5 rounded">
                              Best Match
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-zinc-400 font-mono">
                          {rec.distanceKm} km · {rec.etaMinutes} mins ETA
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block font-mono">MATCH SCORE</span>
                        <span className={`text-base sm:text-lg font-black font-mono ${
                          rec.score >= 80 ? 'text-white font-black' : rec.score >= 60 ? 'text-zinc-300' : 'text-red-500'
                        }`}>
                          {rec.score}%
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="destinationHospital"
                        checked={isSelected}
                        onChange={() => {
                          playClickTone();
                          setSelectedHospitalId(rec.hospital.id);
                        }}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 bg-black border-zinc-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${rec.roomAvailable ? 'bg-white' : 'bg-red-600'}`} />
                      <span className="text-zinc-300">
                        {requiredRoom}: <strong className={rec.roomAvailable ? 'text-white' : 'text-red-500'}>
                          {rec.roomAvailable ? `${rec.availableRoomCount} Open & Ready` : 'Full / Unavailable'}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${rec.hasSpecialist ? 'bg-white' : 'bg-red-600'}`} />
                      <span className="text-zinc-300">
                        Specialist: <strong className={rec.hasSpecialist ? 'text-white' : 'text-zinc-400'}>
                          {rec.hasSpecialist ? `${rec.availableDoctors[0].name} (On-Duty)` : 'General Duty Staff on Floor'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 italic mt-2 bg-black p-2 rounded-xl border border-zinc-800">
                    💡 {rec.recommendationReason}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
