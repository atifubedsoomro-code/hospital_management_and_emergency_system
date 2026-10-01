import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { DoctorAvatar } from './DoctorAvatar';
import { DoctorStatus } from '../types';
import { 
  Clock, 
  Plus, 
  Check, 
  Droplet, 
  Scan, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Activity, 
  Flame, 
  Coffee, 
  PowerOff
} from 'lucide-react';

export const DoctorView: React.FC = () => {
  const { 
    doctors, 
    hospitals, 
    dispatches, 
    selectedDoctorId, 
    setSelectedDoctorId,
    updateDoctorStatus,
    acknowledgePatientByDoctor,
    broadcastHospitalAlert,
    playClickTone
  } = useHospital();

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const currentHospital = hospitals.find((h) => h.id === currentDoctor.hospitalId) || hospitals[0];

  const [availableUntilTime, setAvailableUntilTime] = useState<string>(currentDoctor.availableUntil || '20:00');
  const [statusNote, setStatusNote] = useState<string>(currentDoctor.note || 'On-duty in River City Hospital Sukkur Trauma Center.');
  const [isUpdatingShift, setIsUpdatingShift] = useState<boolean>(false);

  const inboundDispatches = dispatches.filter(
    (d) =>
      d.status !== 'handover_completed' &&
      (d.targetHospitalId === currentDoctor.hospitalId || d.requiredSpecialty === currentDoctor.specialty)
  );

  const handleStatusChange = (status: DoctorStatus) => {
    playClickTone();
    updateDoctorStatus(currentDoctor.id, status, availableUntilTime, statusNote);
  };

  const handleSaveShiftTime = (e: React.FormEvent) => {
    e.preventDefault();
    playClickTone();
    updateDoctorStatus(currentDoctor.id, currentDoctor.status, availableUntilTime, statusNote);
    setIsUpdatingShift(false);
  };

  const handleQuickAddAvailability = (hours: number) => {
    playClickTone();
    const now = new Date();
    now.setHours(now.getHours() + hours);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAvailableUntilTime(timeStr);
    updateDoctorStatus(currentDoctor.id, currentDoctor.status, timeStr, statusNote);
  };

  const handleOrderPreArrival = (dispatchId: string, protocolName: string) => {
    playClickTone();
    broadcastHospitalAlert(
      `STAT ORDER: ${protocolName}`,
      `${currentDoctor.name} initiated pre-arrival preparation for incoming dispatch #${dispatchId.slice(-4)}. Emergency staff alerted.`,
      'critical',
      currentHospital.id
    );
  };

  const handleAcknowledge = (dispId: string) => {
    playClickTone();
    acknowledgePatientByDoctor(dispId, currentDoctor.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      {/* Doctor Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3.5">
            <DoctorAvatar src={currentDoctor.avatar} name={currentDoctor.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{currentDoctor.name}</h2>
                <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-black px-1.5 py-0.5 rounded">
                  On-Duty
                </span>
              </div>
              <p className="text-xs text-red-400 font-semibold">{currentDoctor.specialty}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <strong className="text-white">{currentHospital.name}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-mono text-zinc-300">{currentDoctor.phone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Profile Switcher & Logo Frame */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold mb-1">Switch Doctor Profile:</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  playClickTone();
                  setSelectedDoctorId(e.target.value);
                  const doc = doctors.find((d) => d.id === e.target.value);
                  if (doc) {
                    setAvailableUntilTime(doc.availableUntil);
                    setStatusNote(doc.note || '');
                  }
                }}
                className="bg-black border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>
            <HospitalLogoFrame size="sm" withGlow={false} />
          </div>
        </div>

        {/* Real-time Duty Status Grid */}
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Duty & Availability Status (Broadcast to Ambulance Routing)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              {
                status: 'available',
                label: 'Available',
                desc: 'Ready for intake',
                icon: CheckCircle2,
                activeBg: 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] font-black',
                indicator: 'bg-white',
              },
              {
                status: 'in_surgery',
                label: 'In Surgery',
                desc: 'Theater blocked',
                icon: Activity,
                activeBg: 'bg-zinc-800 border-white text-white shadow-lg font-black',
                indicator: 'bg-amber-400',
              },
              {
                status: 'emergency_call',
                label: 'Code Blue',
                desc: 'Resus critical',
                icon: Flame,
                activeBg: 'bg-red-700 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] font-black',
                indicator: 'bg-red-400',
              },
              {
                status: 'on_break',
                label: 'On Break',
                desc: 'Delayed standby',
                icon: Coffee,
                activeBg: 'bg-zinc-800 border-zinc-600 text-white shadow-lg font-black',
                indicator: 'bg-zinc-400',
              },
              {
                status: 'off_duty',
                label: 'Off Duty',
                desc: 'Shift finished',
                icon: PowerOff,
                activeBg: 'bg-black border-zinc-600 text-zinc-400 shadow-lg',
                indicator: 'bg-zinc-600',
              },
            ].map((item) => {
              const isActive = currentDoctor.status === item.status;
              const Icon = item.icon;
              return (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => handleStatusChange(item.status as DoctorStatus)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                    isActive ? item.activeBg : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className={`w-2 h-2 rounded-full ${item.indicator} ${isActive ? 'animate-ping' : ''}`} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block truncate">{item.label}</span>
                    <span className="text-[10px] opacity-75 block truncate">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Availability Window */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-black border border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Availability Window for Ambulance Dispatch
              </span>
              <div className="flex items-center gap-2 text-xs text-zinc-300 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>Shift: <strong className="font-mono text-white">{currentDoctor.shiftStart} - {currentDoctor.shiftEnd}</strong></span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>Available Until: <strong className="font-mono text-red-400 text-sm">{currentDoctor.availableUntil}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleQuickAddAvailability(1)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs border border-zinc-700 cursor-pointer active:scale-95 flex items-center gap-1"
                title="Extend availability by 1 hour"
              >
                <Plus className="w-3 h-3" />
                <span>1h</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddAvailability(2)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs border border-zinc-700 cursor-pointer active:scale-95 flex items-center gap-1"
                title="Extend availability by 2 hours"
              >
                <Plus className="w-3 h-3" />
                <span>2h</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickTone();
                  setIsUpdatingShift(!isUpdatingShift);
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer btn-neon-red active:scale-95"
              >
                {isUpdatingShift ? 'Close' : 'Edit Time'}
              </button>
            </div>
          </div>

          {isUpdatingShift && (
            <form onSubmit={handleSaveShiftTime} className="pt-3 border-t border-zinc-800 mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Available Until (HH:MM)</label>
                <input
                  type="time"
                  value={availableUntilTime}
                  onChange={(e) => setAvailableUntilTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 uppercase">On-Duty Station Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  placeholder="e.g. In Cath Lab Suite 1"
                />
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 px-3 rounded-xl shadow cursor-pointer uppercase tracking-wider btn-neon-red"
              >
                Save Availability
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Inbound Ambulances & Emergency Handovers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
              Inbound Emergency Ambulances ({inboundDispatches.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Firestore Real-Time</span>
        </div>

        {inboundDispatches.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-2.5 text-zinc-500">
              <CheckCircle2 className="w-5 h-5 text-zinc-600" />
            </div>
            <h4 className="text-zinc-300 font-bold text-sm">No Pending Inbound Emergencies</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Your specialty is standing by. When an ambulance routes a patient to your station, real-time telemetry will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inboundDispatches.map((disp) => {
              const isAcknowledged = disp.doctorAcknowledged;
              const isAssignedToThisDoctor = disp.assignedDoctorId === currentDoctor.id;

              return (
                <div
                  key={disp.id}
                  className={`bg-zinc-950 border rounded-3xl p-4 sm:p-5 shadow-xl transition-all ${
                    disp.esiLevel === 1
                      ? 'border-red-600/70 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                      : 'border-zinc-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase">
                          ESI {disp.esiLevel} CRITICAL
                        </span>
                        <span className="font-mono text-xs text-white font-bold">{disp.ambulanceCallsign}</span>
                        {isAssignedToThisDoctor && (
                          <span className="text-[10px] font-mono text-red-400 border border-red-900 bg-red-950 px-1.5 py-0.5 rounded">
                            DIRECT REFERRAL
                          </span>
                        )}
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white mt-1">
                        {disp.patientName}, {disp.age}y ({disp.gender})
                      </h4>
                      <p className="text-xs font-semibold text-red-400">{disp.condition}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block font-mono">ESTIMATED ARRIVAL</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-white animate-pulse">
                        {disp.etaMinutes} MINS
                      </span>
                      <span className="text-[11px] text-zinc-400 block font-mono">{disp.distanceKm} km away</span>
                    </div>
                  </div>

                  {/* Telemetry Strip */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3 font-mono text-center text-xs">
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block uppercase">HR</span>
                      <span className="font-bold text-red-500">{disp.vitals.heartRate} bpm</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block uppercase">BP</span>
                      <span className="font-bold text-white">
                        {disp.vitals.bloodPressureSystolic}/{disp.vitals.bloodPressureDiastolic}
                      </span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block uppercase">SpO2</span>
                      <span className="font-bold text-white">{disp.vitals.oxygenSaturation}%</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block uppercase">RR</span>
                      <span className="font-bold text-zinc-300">{disp.vitals.respiratoryRate}/m</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block uppercase">GCS</span>
                      <span className="font-bold text-white">{disp.vitals.gcs}</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 block uppercase">ROOM</span>
                      <span className="font-bold text-red-400">{disp.requiredRoom}</span>
                    </div>
                  </div>

                  {disp.notes && (
                    <p className="text-xs text-zinc-300 bg-black p-2.5 rounded-xl border border-zinc-800 mb-3">
                      <strong>Paramedic Notes:</strong> {disp.notes}
                    </p>
                  )}

                  {/* Pre-arrival order buttons & confirmation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOrderPreArrival(disp.id, 'STAT Trauma Blood Pack Reserve')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700 cursor-pointer hover:border-red-500 active:scale-95 flex items-center gap-1.5 transition-all"
                      >
                        <Droplet className="w-3.5 h-3.5 text-red-500" />
                        <span>Reserve Blood</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOrderPreArrival(disp.id, 'Emergency CT Scanner Reserve')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700 cursor-pointer hover:border-red-500 active:scale-95 flex items-center gap-1.5 transition-all"
                      >
                        <Scan className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Reserve CT</span>
                      </button>
                    </div>

                    <div>
                      {isAcknowledged ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white border border-red-500 font-bold text-xs">
                          <Check className="w-4 h-4 text-red-500" />
                          <span>Doctor Confirmed Ready</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(disp.id)}
                          className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer uppercase tracking-wider btn-neon-red"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm Doctor Ready</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
