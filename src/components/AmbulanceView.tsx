import React, { useState, useMemo } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalMap } from './HospitalMap';
import { 
  EmergencyCondition, 
  EsiLevel, 
  RoomType, 
  Specialty, 
  PatientVitals,
  DispatchStatus
} from '../types';
import { evaluateHospitals } from '../services/routingAlgorithm';

export const AmbulanceView: React.FC = () => {
  const { 
    hospitals, 
    doctors, 
    dispatches, 
    submitPatientIntake, 
    updateDispatchStatus,
    moveAmbulanceTowardsTarget,
    selectedAmbulanceId,
    setSelectedAmbulanceId
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'intake' | 'active_transit'>('intake');

  const [patientName, setPatientName] = useState<string>('Muhammad Rafiq Soomro');
  const [age, setAge] = useState<number>(54);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [condition, setCondition] = useState<EmergencyCondition>('Cardiac Arrest / STEMI');
  const [esiLevel, setEsiLevel] = useState<EsiLevel>(1);
  const [requiredRoom, setRequiredRoom] = useState<RoomType>('Cath Lab');
  const [requiredSpecialty, setRequiredSpecialty] = useState<Specialty>('Cardiology / Cath Lab');
  const [notes, setNotes] = useState<string>('Patient picked up near Sukkur Bypass with crushing substernal chest pain. 12-lead ECG confirms acute anterior STEMI.');

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

    setActiveTab('active_transit');
  };

  const handleNextStatus = (currentStatus: DispatchStatus) => {
    if (!currentDispatch) return;
    const flow: DispatchStatus[] = ['en_route_scene', 'on_scene', 'transporting', 'arrived_hospital', 'handover_completed'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < flow.length - 1) {
      updateDispatchStatus(currentDispatch.id, flow[currentIndex + 1]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header / Unit Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-950/60 border border-red-500">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-wide">AMBULANCE RAPID RESPONSE COCKPIT</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-400 border border-red-800 uppercase">
                Sukkur Sector
              </span>
            </div>
            <p className="text-xs text-zinc-400">Unit ID: <span className="font-mono text-white font-bold">{selectedAmbulanceId}</span> • GPS Telemetry Active</p>
          </div>
        </div>

        {/* Unit Selector & Tab Switch */}
        <div className="flex items-center gap-2">
          <select
            value={selectedAmbulanceId}
            onChange={(e) => setSelectedAmbulanceId(e.target.value)}
            className="bg-black border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="RESCUE-1122-SK04">Sindh Rescue 1122 (Unit 04 Sukkur)</option>
            <option value="EDHI-115-SK09">Edhi Ambulance (Unit 115 Sukkur)</option>
            <option value="CHHIPA-1020-SK12">Chhipa Ambulance (Unit 1020 Sukkur)</option>
          </select>

          <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('intake')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'intake'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Rapid Intake
            </button>
            <button
              onClick={() => setActiveTab('active_transit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'active_transit'
                  ? 'bg-white text-black font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Transit {currentDispatch ? `(${currentDispatch.etaMinutes}m)` : ''}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'active_transit' && currentDispatch ? (
        <div className="space-y-5">
          {/* Active Dispatch Card */}
          <div className="bg-zinc-950 border border-red-600/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">ACTIVE EMERGENCY TRANSIT</span>
                <h3 className="text-xl font-black text-white">{currentDispatch.patientName}, {currentDispatch.age}y ({currentDispatch.gender})</h3>
                <p className="text-xs text-zinc-300 font-semibold">{currentDispatch.condition}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block font-mono">ESTIMATED TRANSIT</span>
                  <span className="text-2xl font-black font-mono text-red-500">{currentDispatch.etaMinutes} MINS</span>
                  <span className="text-[11px] text-zinc-400 block font-mono">{currentDispatch.distanceKm} km to door</span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-red-600 text-white font-black text-sm uppercase shadow-md">
                  ESI {currentDispatch.esiLevel}
                </div>
              </div>
            </div>

            {/* Target Hospital & Assigned Doctor Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-black p-3.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Destination Facility</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-white border border-zinc-700">
                    Reserved: {currentDispatch.requiredRoom}
                  </span>
                </div>
                <h4 className="font-bold text-base text-white">
                  {hospitals.find((h) => h.id === currentDispatch.targetHospitalId)?.name || 'River City Hospital Sukkur'}
                </h4>
                <p className="text-xs text-zinc-400">
                  {hospitals.find((h) => h.id === currentDispatch.targetHospitalId)?.address}
                </p>
              </div>

              <div className="bg-black p-3.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Assigned Specialist</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    currentDispatch.doctorAcknowledged 
                      ? 'bg-red-950 text-red-300 border border-red-700' 
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                  }`}>
                    {currentDispatch.doctorAcknowledged ? '✓ Doctor Ready' : '⏳ Awaiting Confirmation'}
                  </span>
                </div>
                <h4 className="font-bold text-base text-white">
                  {doctors.find((d) => d.id === currentDispatch.assignedDoctorId)?.name || 'Dr. Tariq Soomro'}
                </h4>
                <p className="text-xs text-zinc-400">
                  {currentDispatch.requiredSpecialty}
                </p>
              </div>
            </div>

            {/* Live Vitals Broadcast Bar */}
            <div className="bg-black p-3.5 rounded-2xl border border-zinc-800 mb-5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Live Encrypted Patient Telemetry</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Heart Rate</span>
                  <span className="text-base font-bold text-red-500">{currentDispatch.vitals.heartRate} bpm</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Blood Press.</span>
                  <span className="text-base font-bold text-white">
                    {currentDispatch.vitals.bloodPressureSystolic}/{currentDispatch.vitals.bloodPressureDiastolic}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Oxygen SpO2</span>
                  <span className="text-base font-bold text-white">{currentDispatch.vitals.oxygenSaturation}%</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Resp Rate</span>
                  <span className="text-base font-bold text-zinc-200">{currentDispatch.vitals.respiratoryRate}/m</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">GCS Scale</span>
                  <span className="text-base font-bold text-white">{currentDispatch.vitals.gcs} / 15</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Temp</span>
                  <span className="text-base font-bold text-zinc-200">{currentDispatch.vitals.temperatureC}°C</span>
                </div>
              </div>
            </div>

            {/* Tactical Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveAmbulanceTowardsTarget(currentDispatch.id)}
                  className="bg-white hover:bg-zinc-200 text-black font-black text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer uppercase"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Simulate Driving Closer (Update GPS)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNextStatus(currentDispatch.status)}
                  className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-red-950/60 uppercase tracking-wide flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Advance Status: {currentDispatch.status.replace('_', ' ')}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Leaflet Navigation Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Sukkur Corridor Tactical GIS Map
              </h3>
              <span className="text-xs text-zinc-500">Live vector fast path to {currentDispatch.requiredRoom}</span>
            </div>
            <HospitalMap
              hospitals={hospitals}
              dispatches={dispatches}
              selectedDispatchId={currentDispatch.id}
              heightClass="h-[360px]"
            />
          </div>
        </div>
      ) : (
        /* RAPID PATIENT INTAKE */
        <form onSubmit={handleIntakeSubmit} className="space-y-6">
          {/* Quick Presets */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-lg">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
              1-Tap Critical Emergency Presets (Acuity Protocols)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Cardiac STEMI (Heart Attack)', icon: '❤️', cond: 'Cardiac Arrest / STEMI' },
                { label: 'Severe Trauma / Hemorrhage', icon: '🩸', cond: 'Severe Trauma / Hemorrhage' },
                { label: 'Acute Stroke / CVA', icon: '🧠', cond: 'Acute Stroke / CVA' },
                { label: 'Respiratory Failure / ARDS', icon: '🫁', cond: 'Respiratory Failure / ARDS' },
                { label: 'Pediatric Emergency', icon: '👶', cond: 'Pediatric Severe Distress' },
                { label: 'Sepsis / Shock', icon: '⚠️', cond: 'Sepsis / Septic Shock' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectConditionPreset(item.cond as EmergencyCondition)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    condition === item.cond
                      ? 'bg-red-950 border-red-500 text-white shadow-md shadow-red-950'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Details & Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
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
                    onClick={() => setPatientName(`Unidentified Trauma #${Math.floor(100 + Math.random() * 900)}`)}
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
                      onClick={() => setEsiLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        esiLevel === lvl
                          ? 'bg-red-600 border-red-500 text-white shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      L{lvl} {lvl === 1 ? 'Resus' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
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

            {/* Vitals Telemetry Inputs */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
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

          {/* SYSTEM ALGORITHM: SMART HOSPITAL ROUTING RANKING */}
          <div className="bg-zinc-950 border border-red-600/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="text-base font-black text-white tracking-wide uppercase">
                  System Algorithm: Sukkur Facility Recommendation
                </h3>
              </div>
              <span className="text-xs font-mono text-red-400">
                Evaluating Distance + {requiredRoom} Capacity + Specialist On Duty
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              The algorithm evaluates live GPS proximity in Sukkur, available specialized beds, and on-duty Pakistani medical specialists.
            </p>

            <div className="space-y-3">
              {algorithmRecommendations.map((rec, idx) => {
                const isTop = idx === 0;
                const isSelected = selectedHospitalId === rec.hospital.id || (!selectedHospitalId && isTop);

                return (
                  <div
                    key={rec.hospital.id}
                    onClick={() => setSelectedHospitalId(rec.hospital.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
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
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-400 border border-red-800 uppercase">
                                ★ Best Clinical Match
                              </span>
                            )}
                          </h4>
                          <span className="text-xs text-zinc-400 font-mono">
                            {rec.distanceKm} km • {rec.etaMinutes} mins ETA
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 block font-mono">MATCH SCORE</span>
                          <span className={`text-lg font-black font-mono ${
                            rec.score >= 80 ? 'text-white font-black' : rec.score >= 60 ? 'text-zinc-300' : 'text-red-500'
                          }`}>
                            {rec.score}%
                          </span>
                        </div>
                        <input
                          type="radio"
                          name="destinationHospital"
                          checked={isSelected}
                          onChange={() => setSelectedHospitalId(rec.hospital.id)}
                          className="w-5 h-5 text-red-600 focus:ring-red-500 bg-black border-zinc-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${rec.roomAvailable ? 'bg-white' : 'bg-red-600'}`}></span>
                        <span className="text-zinc-300">
                          {requiredRoom}: <strong className={rec.roomAvailable ? 'text-white' : 'text-red-500'}>
                            {rec.roomAvailable ? `${rec.availableRoomCount} Open & Ready` : 'Full / Unavailable'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${rec.hasSpecialist ? 'bg-white' : 'bg-red-600'}`}></span>
                        <span className="text-zinc-300">
                          Specialist: <strong className={rec.hasSpecialist ? 'text-white' : 'text-zinc-400'}>
                            {rec.hasSpecialist ? `${rec.availableDoctors[0].name} (On-Duty)` : 'General Duty Staff on Floor'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 italic mt-2 bg-black p-2 rounded-xl border border-zinc-800">
                      💡 {rec.recommendationReason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-base py-4 rounded-2xl shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 tracking-wide uppercase transition-all active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Initiate Emergency Dispatch & Alert Hospital
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
