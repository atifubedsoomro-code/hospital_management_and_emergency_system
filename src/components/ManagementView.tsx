import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalMap } from './HospitalMap';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { DoctorAvatar } from './DoctorAvatar';
import { DoctorStatus } from '../types';
import { 
  Building2, 
  Plus, 
  Minus, 
  Megaphone, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Bed, 
  Activity, 
  HeartPulse, 
  Wind, 
  Droplet, 
  Filter, 
  X, 
  Clock, 
  MapPin,
  Radio
} from 'lucide-react';

export const ManagementView: React.FC = () => {
  const { 
    hospitals, 
    doctors, 
    dispatches, 
    activeHospitalId, 
    setActiveHospitalId,
    updateHospitalAssets,
    updateDoctorStatus,
    broadcastHospitalAlert,
    updateDispatchStatus,
    playClickTone
  } = useHospital();

  const currentHospital = hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState<string>('HIGHWAY COLLISION PROTOCOL: PHASE 1');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('River City Hospital Sukkur trauma unit clear standby bays. Multi-casualty intake expected.');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'critical' | 'high' | 'normal'>('critical');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  const inboundDispatches = dispatches.filter((d) => d.status !== 'handover_completed');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesHosp = doc.hospitalId === currentHospital.id;
    const matchesSpec = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty;
    return matchesHosp && matchesSpec;
  });

  const handleAssetChange = (field: keyof typeof currentHospital.assets, delta: number) => {
    playClickTone();
    const currentVal = Number(currentHospital.assets[field]) || 0;
    const nextVal = Math.max(0, currentVal + delta);
    updateHospitalAssets(currentHospital.id, { [field]: nextVal });
  };

  const handleToggleDivert = () => {
    playClickTone();
    updateHospitalAssets(currentHospital.id, {}, !currentHospital.divertStatus);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    playClickTone();
    setIsBroadcasting(true);
    broadcastHospitalAlert(broadcastTitle, broadcastMessage, broadcastUrgency, currentHospital.id);
    setIsBroadcasting(false);
    setShowBroadcastModal(false);
  };

  const handleStatusChange = (docId: string, status: DoctorStatus) => {
    playClickTone();
    updateDoctorStatus(docId, status);
  };

  const handleAdmitPatient = (dispId: string) => {
    playClickTone();
    updateDispatchStatus(dispId, 'handover_completed');
  };

  const icuOccupancyPercent = Math.round(
    ((currentHospital.assets.icuTotal - currentHospital.assets.icuAvailable) / currentHospital.assets.icuTotal) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <HospitalLogoFrame size="md" withGlow={true} />
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">Executive Command Center</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono">River City Sukkur</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={activeHospitalId}
                onChange={(e) => {
                  playClickTone();
                  setActiveHospitalId(e.target.value);
                }}
                className="bg-black border border-zinc-700 rounded-xl px-3 py-1.5 sm:py-2 text-sm sm:text-base font-black text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 uppercase ${
                currentHospital.divertStatus
                  ? 'bg-red-950 text-red-400 border-red-700 animate-pulse'
                  : 'bg-zinc-900 text-white border-zinc-700'
              }`}>
                {currentHospital.divertStatus ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Divert Active</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                    <span>Receiving Inbound</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleToggleDivert}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 ${
              currentHospital.divertStatus
                ? 'bg-white hover:bg-zinc-200 text-black border-white shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
            }`}
          >
            {currentHospital.divertStatus ? 'Resume Intake' : 'Activate Divert'}
          </button>

          <button
            type="button"
            onClick={() => {
              playClickTone();
              setShowBroadcastModal(true);
            }}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.7)] flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider btn-neon-red active:scale-95"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Facility Assets Allocation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Critical Assets & Bed Allocation ({currentHospital.name})</span>
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">Synced to Firestore</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* ICU Beds */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-red-500" />
                <span>ICU Beds</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">{icuOccupancyPercent}% Full</span>
            </div>
            <div className="text-2xl font-black font-mono text-white my-1">
              <span className={currentHospital.assets.icuAvailable > 0 ? 'text-white' : 'text-red-500'}>
                {currentHospital.assets.icuAvailable}
              </span>
              <span className="text-xs text-zinc-500 font-normal"> / {currentHospital.assets.icuTotal}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAssetChange('icuAvailable', -1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Occupy ICU bed"
                aria-label="Occupy ICU bed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAssetChange('icuAvailable', 1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Free up ICU bed"
                aria-label="Free up ICU bed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-400 ml-auto">Free</span>
            </div>
          </div>

          {/* Trauma Bays */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span>Trauma Bays</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Resus</span>
            </div>
            <div className="text-2xl font-black font-mono text-red-400 my-1">
              {currentHospital.assets.traumaBaysAvailable}
              <span className="text-xs text-zinc-500 font-normal"> / {currentHospital.assets.traumaBaysTotal}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAssetChange('traumaBaysAvailable', -1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Occupy trauma bay"
                aria-label="Occupy trauma bay"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAssetChange('traumaBaysAvailable', 1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Free up trauma bay"
                aria-label="Free up trauma bay"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-400 ml-auto">Bays</span>
            </div>
          </div>

          {/* Cath Lab */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                <span>Cath Lab</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">STEMI</span>
            </div>
            <div className="text-xl font-black font-mono text-white my-1">
              {currentHospital.assets.cathLabAvailable ? (
                <span className="text-white">Open</span>
              ) : (
                <span className="text-red-500">In-Use</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  playClickTone();
                  updateHospitalAssets(currentHospital.id, { cathLabAvailable: !currentHospital.assets.cathLabAvailable });
                }}
                className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  currentHospital.assets.cathLabAvailable
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
                    : 'bg-red-600 border-red-500 text-white'
                }`}
              >
                {currentHospital.assets.cathLabAvailable ? 'Mark In-Use' : 'Mark Open'}
              </button>
            </div>
          </div>

          {/* Ventilators */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-zinc-400" />
                <span>Ventilators</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Life</span>
            </div>
            <div className="text-2xl font-black font-mono text-white my-1">
              {currentHospital.assets.ventilatorsAvailable}
              <span className="text-xs text-zinc-500 font-normal"> Units</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAssetChange('ventilatorsAvailable', -1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Deploy ventilator"
                aria-label="Deploy ventilator"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAssetChange('ventilatorsAvailable', 1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Free ventilator"
                aria-label="Free ventilator"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-400 ml-auto">Units</span>
            </div>
          </div>

          {/* O-Neg Blood */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-red-500" />
                <span>O-Neg Blood</span>
              </span>
              <span className="text-[10px] text-red-400 font-mono">Bank</span>
            </div>
            <div className="text-2xl font-black font-mono text-red-500 my-1">
              {currentHospital.assets.bloodUnitsO_Neg}
              <span className="text-xs text-zinc-500 font-normal"> Units</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAssetChange('bloodUnitsO_Neg', -1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Use blood unit"
                aria-label="Use blood unit"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAssetChange('bloodUnitsO_Neg', 1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Add blood unit"
                aria-label="Add blood unit"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-400 ml-auto">Packs</span>
            </div>
          </div>

          {/* General ER Beds */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-zinc-400" />
                <span>General ER</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Floor</span>
            </div>
            <div className="text-2xl font-black font-mono text-white my-1">
              {currentHospital.assets.availableBeds}
              <span className="text-xs text-zinc-500 font-normal"> / {currentHospital.assets.totalBeds}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAssetChange('availableBeds', -1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Occupy general bed"
                aria-label="Occupy general bed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAssetChange('availableBeds', 1)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95 transition-all"
                title="Free general bed"
                aria-label="Free general bed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-400 ml-auto">Beds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Tactical Map */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Sukkur Emergency Network Map & Live GPS Feeds</span>
          </h3>
          <span className="text-[11px] text-zinc-400 font-mono">Real-Time Radar</span>
        </div>
        <HospitalMap
          hospitals={hospitals}
          dispatches={dispatches}
          heightClass="h-[300px] sm:h-[380px]"
        />
      </div>

      {/* Active Inbound Dispatches */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              Incoming Ambulance Intakes ({inboundDispatches.length})
            </h3>
            <p className="text-xs text-zinc-400">Live triage status and pre-arrival bed allocations</p>
          </div>
        </div>

        {inboundDispatches.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-sm">
            No active ambulance transports currently en route.
          </div>
        ) : (
          <>
            {/* Mobile View: High-Impact Cards */}
            <div className="block lg:hidden space-y-3">
              {inboundDispatches.map((disp) => {
                const targetHosp = hospitals.find((h) => h.id === disp.targetHospitalId);
                const assignedDoc = doctors.find((d) => d.id === disp.assignedDoctorId);

                return (
                  <div key={disp.id} className="bg-black border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            disp.esiLevel === 1 ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'
                          }`}>
                            ESI-{disp.esiLevel}
                          </span>
                          <span className="text-white font-bold text-sm">{disp.patientName}, {disp.age}y</span>
                        </div>
                        <p className="text-xs text-red-400 font-semibold mt-0.5">{disp.condition}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-red-500">{disp.etaMinutes}m ETA</span>
                        <span className="text-[10px] text-zinc-500 block font-mono">{disp.distanceKm} km</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-zinc-800 text-zinc-300">
                      <div>
                        <span>Destination: </span>
                        <strong className="text-white">{targetHosp?.shortName || 'Target Hosp'}</strong>
                        <span className="text-zinc-500 font-mono ml-1">({disp.requiredRoom})</span>
                      </div>

                      <div>
                        {assignedDoc ? (
                          <span className="text-zinc-300">
                            Doc: <strong className="text-white">{assignedDoc.name.split(',')[0]}</strong>
                          </span>
                        ) : (
                          <span className="text-zinc-400">On-Call Staff</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-bold ${
                        disp.doctorAcknowledged ? 'text-red-400' : 'text-zinc-400'
                      }`}>
                        {disp.doctorAcknowledged ? '✓ Doctor Confirmed' : '⏳ Awaiting doc'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAdmitPatient(disp.id)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow cursor-pointer uppercase tracking-wider flex items-center gap-1 active:scale-95 btn-neon-red"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Admit Patient</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Tabular */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-black text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Patient / Acuity</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Target Facility</th>
                    <th className="py-2.5 px-3">Room Required</th>
                    <th className="py-2.5 px-3">Assigned Specialist</th>
                    <th className="py-2.5 px-3 text-right">ETA</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-medium">
                  {inboundDispatches.map((disp) => {
                    const targetHosp = hospitals.find((h) => h.id === disp.targetHospitalId);
                    const assignedDoc = doctors.find((d) => d.id === disp.assignedDoctorId);

                    return (
                      <tr key={disp.id} className="hover:bg-black/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              disp.esiLevel === 1 ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white border border-zinc-700'
                            }`}>
                              ESI-{disp.esiLevel}
                            </span>
                            <span className="text-white font-bold">{disp.patientName}, {disp.age}y</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-red-400 font-semibold">
                          {disp.condition}
                        </td>

                        <td className="py-3 px-3 text-white">
                          {targetHosp?.shortName || 'Target Hosp'}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-zinc-300">
                            {disp.requiredRoom}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-white block font-semibold">{assignedDoc?.name || 'On-Call'}</span>
                          <span className={`text-[10px] ${disp.doctorAcknowledged ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                            {disp.doctorAcknowledged ? '✓ Confirmed' : '⏳ Awaiting doc'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-sm text-red-500 block">{disp.etaMinutes}m</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{disp.distanceKm} km</span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleAdmitPatient(disp.id)}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shadow transition-all cursor-pointer uppercase tracking-wider btn-neon-red flex items-center gap-1 ml-auto"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Admit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Staff Duty Roster */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              Staff Schedules & Duty Roster ({currentHospital.name})
            </h3>
            <p className="text-xs text-zinc-400">On-call specialists synchronized with ambulance dispatch</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                playClickTone();
                setSelectedSpecialty(e.target.value);
              }}
              className="bg-black border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white font-semibold cursor-pointer"
            >
              <option value="all">All Specialties</option>
              <option value="Trauma Surgery">Trauma Surgery</option>
              <option value="Cardiology / Cath Lab">Cardiology / Cath Lab</option>
              <option value="Neurology / Stroke">Neurology / Stroke</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Pulmonology / ICU">Pulmonology / ICU</option>
              <option value="Pediatric Emergency">Pediatric Emergency</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-black border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <DoctorAvatar src={doc.avatar} name={doc.name} size="md" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{doc.name}</h4>
                    <span className="text-xs text-red-400 block font-semibold truncate">{doc.specialty}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-zinc-400 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>Shift Hours:</span>
                    </span>
                    <span className="font-mono text-zinc-200">{doc.shiftStart} - {doc.shiftEnd}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Available Until:</span>
                    <span className="font-mono text-white font-bold">{doc.availableUntil}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      <span>Station:</span>
                    </span>
                    <span className="text-zinc-300">{doc.currentRoom || 'ER Ward'}</span>
                  </div>
                </div>
              </div>

              {/* Status Switcher for Management */}
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Set Duty Status:</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'available', label: 'Available', col: 'bg-red-600 text-white border-red-500' },
                    { id: 'in_surgery', label: 'Surgery', col: 'bg-zinc-800 text-white border-zinc-600' },
                    { id: 'emergency_call', label: 'Code Blue', col: 'bg-red-950 text-red-400 border-red-800' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStatusChange(doc.id, s.id as DoctorStatus)}
                      className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        doc.status === s.id ? `${s.col} ring-1 ring-white/20 font-black` : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-red-600 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 neon-card-glow">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-red-500">
                <Megaphone className="w-5 h-5 animate-pulse text-red-500" />
                <h3 className="font-black text-base sm:text-lg text-white">Broadcast Emergency Alert</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickTone();
                  setShowBroadcastModal(false);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
                aria-label="Close broadcast modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['critical', 'high', 'normal'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => {
                        playClickTone();
                        setBroadcastUrgency(urg);
                      }}
                      className={`py-2 rounded-xl text-xs font-black uppercase border transition-all cursor-pointer ${
                        broadcastUrgency === urg
                          ? urg === 'critical'
                            ? 'bg-red-600 border-red-500 text-white shadow-lg'
                            : 'bg-zinc-800 border-white text-white shadow-lg'
                          : 'bg-black border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Alert Headline</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setShowBroadcastModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg uppercase tracking-wide cursor-pointer btn-neon-red flex items-center gap-1.5"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Transmit Push Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
