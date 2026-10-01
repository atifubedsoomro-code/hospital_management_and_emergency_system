import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalMap } from './HospitalMap';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { DoctorAvatar } from './DoctorAvatar';
import { DoctorStatus } from '../types';

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
    updateDispatchStatus
  } = useHospital();

  const currentHospital = hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState<string>('HIGHWAY COLLISION PROTOCOL: PHASE 1');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('River City Hospital Sukkur and Civil Hospital trauma units clear standby bays. Multi-casualty intake expected.');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'critical' | 'high' | 'normal'>('critical');

  const inboundDispatches = dispatches.filter((d) => d.status !== 'handover_completed');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesHosp = doc.hospitalId === currentHospital.id;
    const matchesSpec = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty;
    return matchesHosp && matchesSpec;
  });

  const handleAssetChange = (field: keyof typeof currentHospital.assets, delta: number) => {
    const currentVal = Number(currentHospital.assets[field]) || 0;
    const nextVal = Math.max(0, currentVal + delta);
    updateHospitalAssets(currentHospital.id, { [field]: nextVal });
  };

  const handleToggleDivert = () => {
    updateHospitalAssets(currentHospital.id, {}, !currentHospital.divertStatus);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    broadcastHospitalAlert(broadcastTitle, broadcastMessage, broadcastUrgency, currentHospital.id);
    setShowBroadcastModal(false);
  };

  const icuOccupancyPercent = Math.round(
    ((currentHospital.assets.icuTotal - currentHospital.assets.icuAvailable) / currentHospital.assets.icuTotal) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top Facility Switcher & Urgent Action Bar with Framed Logo */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <HospitalLogoFrame size="md" withGlow={true} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-400 border border-red-800 uppercase tracking-wider font-mono">
                Executive Command Center
              </span>
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">River City Sukkur</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={activeHospitalId}
                onChange={(e) => setActiveHospitalId(e.target.value)}
                className="bg-black border border-zinc-700 rounded-xl px-3 py-1.5 sm:py-2 text-sm sm:text-base font-black text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border uppercase ${
                currentHospital.divertStatus
                  ? 'bg-red-950 text-red-400 border-red-700 animate-pulse'
                  : 'bg-zinc-900 text-white border-zinc-700'
              }`}>
                {currentHospital.divertStatus ? '⚠️ Divert Active' : '✓ Receiving Inbound'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleToggleDivert}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer uppercase tracking-wider ${
              currentHospital.divertStatus
                ? 'bg-white hover:bg-zinc-200 text-black border-white'
                : 'bg-red-950 hover:bg-red-900 text-red-300 hover:text-white border-red-700'
            }`}
          >
            {currentHospital.divertStatus ? 'Resume Intake' : 'Activate Divert'}
          </button>

          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.7)] flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider btn-neon-red"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Asset Management & Capacity Gauges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            Facility Assets & Critical Resource Allocation ({currentHospital.name})
          </h3>
          <span className="text-[11px] text-zinc-400 font-mono">Synced to Firestore</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {/* ICU Beds */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ICU Beds</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                currentHospital.assets.icuAvailable > 1 ? 'bg-zinc-900 text-white border border-zinc-700' : 'bg-red-950 text-red-400 border border-red-800'
              }`}>
                {icuOccupancyPercent}% Full
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mb-2">
              <span className={currentHospital.assets.icuAvailable > 0 ? 'text-white' : 'text-red-500'}>
                {currentHospital.assets.icuAvailable}
              </span>
              <span className="text-xs text-zinc-500 font-normal"> / {currentHospital.assets.icuTotal}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAssetChange('icuAvailable', -1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
                title="Occupy bed"
              >
                -
              </button>
              <button
                onClick={() => handleAssetChange('icuAvailable', 1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
                title="Free up bed"
              >
                +
              </button>
              <span className="text-[10px] text-zinc-400 ml-1">Open</span>
            </div>
          </div>

          {/* Trauma Bays */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-lg">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Trauma Bays</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                Resus
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-red-400 mb-2">
              {currentHospital.assets.traumaBaysAvailable}
              <span className="text-xs text-zinc-500 font-normal"> / {currentHospital.assets.traumaBaysTotal}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAssetChange('traumaBaysAvailable', -1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                -
              </button>
              <button
                onClick={() => handleAssetChange('traumaBaysAvailable', 1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                +
              </button>
              <span className="text-[10px] text-zinc-400 ml-1">Bays</span>
            </div>
          </div>

          {/* Cath Lab */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-lg">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cath Lab</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                currentHospital.assets.cathLabAvailable ? 'bg-zinc-900 text-white border border-zinc-700' : 'bg-red-950 text-red-400 border border-red-800'
              }`}>
                {currentHospital.assets.cathLabAvailable ? 'Active' : 'Down'}
              </span>
            </div>
            <div className="text-sm font-black text-white mt-1 mb-2">
              {currentHospital.assets.cathLabAvailable ? 'STEMI Ready' : 'Offline'}
            </div>
            <button
              onClick={() => updateHospitalAssets(currentHospital.id, { cathLabAvailable: !currentHospital.assets.cathLabAvailable })}
              className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold border border-zinc-700 cursor-pointer hover:border-red-500"
            >
              Toggle
            </button>
          </div>

          {/* Ventilators */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-lg">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ventilators</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                Critical
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mb-2">
              {currentHospital.assets.ventilatorsAvailable}
              <span className="text-xs text-zinc-500 font-normal"> Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAssetChange('ventilatorsAvailable', -1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                -
              </button>
              <button
                onClick={() => handleAssetChange('ventilatorsAvailable', 1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                +
              </button>
              <span className="text-[10px] text-zinc-400 ml-1">Units</span>
            </div>
          </div>

          {/* Blood Units */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-lg">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Blood (O-)</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                Universal
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-red-500 mb-2">
              {currentHospital.assets.bloodUnitsO_Neg}
              <span className="text-xs text-zinc-500 font-normal"> Packs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAssetChange('bloodUnitsO_Neg', -2)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                -2
              </button>
              <button
                onClick={() => handleAssetChange('bloodUnitsO_Neg', 2)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                +2
              </button>
              <span className="text-[10px] text-zinc-400 ml-1">Packs</span>
            </div>
          </div>

          {/* General Available Beds */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-lg">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">General ER</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-white border border-zinc-700">
                Floor
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mb-2">
              {currentHospital.assets.availableBeds}
              <span className="text-xs text-zinc-500 font-normal"> / {currentHospital.assets.totalBeds}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAssetChange('availableBeds', -1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                -
              </button>
              <button
                onClick={() => handleAssetChange('availableBeds', 1)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center border border-zinc-700 cursor-pointer active:scale-95"
              >
                +
              </button>
              <span className="text-[10px] text-zinc-400 ml-1">Beds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Tactical Map View */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            Sukkur Metropolitan Hospitalization & Ambulance Network Map
          </h3>
          <span className="text-[11px] text-zinc-400">GPS Live Telemetry</span>
        </div>
        <HospitalMap
          hospitals={hospitals}
          dispatches={dispatches}
          heightClass="h-[320px] sm:h-[400px]"
        />
      </div>

      {/* Active Inbound Dispatches (Responsive: Cards on Mobile, Table on Desktop) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              Incoming Ambulance Intakes ({inboundDispatches.length})
            </h3>
            <p className="text-xs text-zinc-400">Synchronized triage data and room reservations saved in Firestore</p>
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

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                      <div>
                        <span className="text-zinc-500 block">Unit:</span>
                        <span className="text-white font-mono">{disp.ambulanceCallsign}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Reserved Room:</span>
                        <span className="text-red-400 font-bold">{disp.requiredRoom}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Hospital:</span>
                        <span className="text-zinc-300">{targetHosp?.shortName || 'Target Hosp'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Doctor:</span>
                        <span className="text-zinc-300">{assignedDoc?.name || 'On-Call'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Status: <strong className="text-white uppercase">{disp.status.replace('_', ' ')}</strong>
                      </span>
                      {disp.status !== 'handover_completed' && (
                        <button
                          type="button"
                          onClick={() => updateDispatchStatus(disp.id, 'handover_completed')}
                          className="bg-red-600 hover:bg-red-500 text-white font-black px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer btn-neon-red"
                        >
                          Admit Patient
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Data Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold uppercase text-zinc-400 border-b border-zinc-800">
                    <th className="py-2.5 px-3">Ambulance Unit</th>
                    <th className="py-2.5 px-3">Patient / Acuity</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Target Hospital</th>
                    <th className="py-2.5 px-3">Reserved Room</th>
                    <th className="py-2.5 px-3">Doctor Standby</th>
                    <th className="py-2.5 px-3 text-right">ETA</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-medium">
                  {inboundDispatches.map((disp) => {
                    const targetHosp = hospitals.find((h) => h.id === disp.targetHospitalId);
                    const assignedDoc = doctors.find((d) => d.id === disp.assignedDoctorId);

                    return (
                      <tr key={disp.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-white block">{disp.ambulanceCallsign}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{disp.driverName}</span>
                        </td>

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
                          <span className="px-2 py-0.5 rounded bg-black text-white font-mono text-[11px] border border-zinc-800">
                            {disp.requiredRoom}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-white block font-semibold">{assignedDoc?.name || 'On-Call'}</span>
                          <span className={`text-[10px] ${disp.doctorAcknowledged ? 'text-red-400 font-bold' : 'text-zinc-400'}`}>
                            {disp.doctorAcknowledged ? '✓ Confirmed' : '⏳ Awaiting doc'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-sm text-red-500 block">{disp.etaMinutes}m</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{disp.distanceKm} km</span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {disp.status !== 'handover_completed' ? (
                              <button
                                type="button"
                                onClick={() => updateDispatchStatus(disp.id, 'handover_completed')}
                                className="bg-red-600 hover:bg-red-500 text-white font-black px-2.5 py-1 rounded-lg text-[11px] shadow transition-all cursor-pointer uppercase tracking-wider btn-neon-red"
                              >
                                Admit Patient
                              </button>
                            ) : (
                              <span className="text-white font-bold text-[11px]">Admitted</span>
                            )}
                          </div>
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

      {/* Staff Schedules & Duty Roster Management */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              Staff Schedules & Duty Roster ({currentHospital.name})
            </h3>
            <p className="text-xs text-zinc-400">On-call Pakistani specialists synchronized across all units</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Filter Specialty:</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
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
                  {/* Resilient DoctorAvatar with picture fallback */}
                  <DoctorAvatar src={doc.avatar} name={doc.name} size="md" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{doc.name}</h4>
                    <span className="text-xs text-red-400 block font-semibold">{doc.specialty}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-zinc-400 mb-3">
                  <div className="flex justify-between">
                    <span>Shift Hours:</span>
                    <span className="font-mono text-zinc-200">{doc.shiftStart} - {doc.shiftEnd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Until:</span>
                    <span className="font-mono text-white font-bold">{doc.availableUntil}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Station:</span>
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
                      onClick={() => updateDoctorStatus(doc.id, s.id as DoctorStatus)}
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
                <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-black text-base sm:text-lg text-white">Broadcast Emergency Network Alert</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
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
                      onClick={() => setBroadcastUrgency(urg)}
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
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg uppercase tracking-wide cursor-pointer btn-neon-red"
                >
                  Transmit Push Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
