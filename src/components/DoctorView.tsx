import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { DoctorStatus } from '../types';

export const DoctorView: React.FC = () => {
  const { 
    doctors, 
    hospitals, 
    dispatches, 
    selectedDoctorId, 
    setSelectedDoctorId,
    updateDoctorStatus,
    acknowledgePatientByDoctor,
    broadcastHospitalAlert
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
    updateDoctorStatus(currentDoctor.id, status, availableUntilTime, statusNote);
  };

  const handleSaveShiftTime = (e: React.FormEvent) => {
    e.preventDefault();
    updateDoctorStatus(currentDoctor.id, currentDoctor.status, availableUntilTime, statusNote);
    setIsUpdatingShift(false);
  };

  const handleQuickAddAvailability = (hours: number) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAvailableUntilTime(timeStr);
    updateDoctorStatus(currentDoctor.id, currentDoctor.status, timeStr, statusNote);
  };

  const handleOrderPreArrival = (dispatchId: string, protocolName: string) => {
    broadcastHospitalAlert(
      `STAT ORDER: ${protocolName}`,
      `${currentDoctor.name} initiated pre-arrival preparation for incoming dispatch #${dispatchId.slice(-4)}. Emergency staff alerted.`,
      'critical',
      currentHospital.id
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Doctor Identity Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3.5">
            <img
              src={currentDoctor.avatar}
              alt={currentDoctor.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-red-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{currentDoctor.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-400 border border-red-800 uppercase">
                  Mobile Doctor Console
                </span>
              </div>
              <p className="text-xs text-red-400 font-semibold">{currentDoctor.specialty}</p>
              <p className="text-[11px] text-zinc-400">
                Hospital: <strong className="text-white">{currentHospital.name}</strong> • Direct Phone: <span className="font-mono text-zinc-300">{currentDoctor.phone}</span>
              </p>
            </div>
          </div>

          {/* Switch Doctor Profile */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold mb-1">Switch Doctor Profile:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
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
        </div>

        {/* Real-time Status Switcher */}
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Duty & Availability Status (Broadcast to Ambulance Routing Algorithm)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              {
                status: 'available',
                label: 'Available / On-Duty',
                desc: 'Ready for intakes',
                bg: 'bg-zinc-900 border-zinc-700 text-white',
                activeBg: 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950 font-black',
                indicator: 'bg-white',
              },
              {
                status: 'in_surgery',
                label: 'In Surgery / OR',
                desc: 'Cannot take patients',
                bg: 'bg-zinc-900 border-zinc-700 text-zinc-300',
                activeBg: 'bg-zinc-800 border-white text-white shadow-lg font-black',
                indicator: 'bg-amber-400',
              },
              {
                status: 'emergency_call',
                label: 'Code Blue / Resus',
                desc: 'Critical case standby',
                bg: 'bg-zinc-900 border-zinc-700 text-zinc-300',
                activeBg: 'bg-red-700 border-red-400 text-white shadow-lg shadow-red-950 font-black',
                indicator: 'bg-red-400',
              },
              {
                status: 'on_break',
                label: 'On Break / Rounds',
                desc: 'Delayed response',
                bg: 'bg-zinc-900 border-zinc-700 text-zinc-300',
                activeBg: 'bg-zinc-800 border-zinc-600 text-white shadow-lg font-black',
                indicator: 'bg-zinc-400',
              },
              {
                status: 'off_duty',
                label: 'Off Duty',
                desc: 'Shift completed',
                bg: 'bg-zinc-900 border-zinc-700 text-zinc-400',
                activeBg: 'bg-black border-zinc-600 text-zinc-400 shadow-lg',
                indicator: 'bg-zinc-600',
              },
            ].map((item) => {
              const isActive = currentDoctor.status === item.status;
              return (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => handleStatusChange(item.status as DoctorStatus)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isActive ? item.activeBg : `${item.bg} hover:border-zinc-500`
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${item.indicator} ${isActive ? 'animate-ping' : ''}`}></span>
                    <span className="font-bold text-xs truncate">{item.label}</span>
                  </div>
                  <span className="text-[10px] opacity-80 block truncate">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time & Shift Availability Station */}
        <div className="mt-4 p-4 rounded-2xl bg-black border border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Availability Window for Ambulance Dispatch
              </span>
              <p className="text-xs text-zinc-300">
                Current Shift: <span className="font-mono text-white font-bold">{currentDoctor.shiftStart} - {currentDoctor.shiftEnd}</span> • Available Until:{' '}
                <span className="font-mono text-red-400 font-bold text-sm">{currentDoctor.availableUntil}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Quick Extend:</span>
              <button
                type="button"
                onClick={() => handleQuickAddAvailability(1)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-2.5 py-1 rounded-lg text-xs border border-zinc-700 cursor-pointer"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddAvailability(2)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-2.5 py-1 rounded-lg text-xs border border-zinc-700 cursor-pointer"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => setIsUpdatingShift(!isUpdatingShift)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer"
              >
                {isUpdatingShift ? 'Close' : 'Edit Time'}
              </button>
            </div>
          </div>

          {isUpdatingShift && (
            <form onSubmit={handleSaveShiftTime} className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Available Until (HH:MM)</label>
                <input
                  type="time"
                  value={availableUntilTime}
                  onChange={(e) => setAvailableUntilTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm text-white font-mono"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-zinc-400 block mb-1">Location / Status Note</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    placeholder="e.g. In Trauma Resus Bay 1, River City Hospital Sukkur."
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer uppercase tracking-wider"
                  >
                    Broadcast Update
                  </button>
                </div>
              </div>
            </form>
          )}

          {currentDoctor.note && (
            <p className="text-xs text-zinc-400 italic mt-2">
              Note on File: "{currentDoctor.note}"
            </p>
          )}
        </div>
      </div>

      {/* Inbound Ambulances & Emergency Handovers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <h3 className="text-base font-black text-white tracking-wide uppercase">
              Inbound Emergency Ambulances ({inboundDispatches.length})
            </h3>
          </div>
          <span className="text-xs text-zinc-400">Firebase Real-time Stream</span>
        </div>

        {inboundDispatches.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-zinc-300 font-bold text-sm">No Pending Inbound Emergencies</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Your specialty is standing by. When an ambulance routes a critical patient to your facility, real-time vitals and telemetry will appear here instantly.
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
                  className={`bg-zinc-950 border rounded-3xl p-5 shadow-xl transition-all ${
                    disp.esiLevel === 1
                      ? 'border-red-600/70 shadow-red-950/40'
                      : 'border-zinc-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase">
                          ESI {disp.esiLevel} CRITICAL
                        </span>
                        <span className="font-mono text-xs text-white font-bold">{disp.ambulanceCallsign}</span>
                        {isAssignedToThisDoctor && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-red-400 border border-red-800">
                            DIRECT REFERRAL
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-white mt-1">
                        {disp.patientName}, {disp.age}y ({disp.gender})
                      </h4>
                      <p className="text-xs font-semibold text-red-400">{disp.condition}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block font-mono">ESTIMATED ARRIVAL</span>
                      <span className="text-2xl font-black font-mono text-white animate-pulse">
                        {disp.etaMinutes} MINS
                      </span>
                      <span className="text-[11px] text-zinc-400 block font-mono">{disp.distanceKm} km away</span>
                    </div>
                  </div>

                  {/* Telemetry Strip */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3 font-mono text-center text-xs">
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">HR</span>
                      <span className="font-bold text-red-500">{disp.vitals.heartRate} bpm</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">BP</span>
                      <span className="font-bold text-white">
                        {disp.vitals.bloodPressureSystolic}/{disp.vitals.bloodPressureDiastolic}
                      </span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">SpO2</span>
                      <span className="font-bold text-white">{disp.vitals.oxygenSaturation}%</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">RR</span>
                      <span className="font-bold text-zinc-300">{disp.vitals.respiratoryRate}/m</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">GCS</span>
                      <span className="font-bold text-white">{disp.vitals.gcs}</span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">ROOM</span>
                      <span className="font-bold text-red-400">{disp.requiredRoom}</span>
                    </div>
                  </div>

                  {disp.notes && (
                    <p className="text-xs text-zinc-300 bg-black p-2.5 rounded-xl border border-zinc-800 mb-3">
                      <strong>Paramedic Field Notes:</strong> {disp.notes}
                    </p>
                  )}

                  {/* Actions & Doctor Confirmation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOrderPreArrival(disp.id, 'STAT Trauma Blood Pack Reserve')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700 cursor-pointer"
                      >
                        🩸 Reserve Blood Pack
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOrderPreArrival(disp.id, 'Emergency CT Scanner Reserve')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700 cursor-pointer"
                      >
                        🔬 Reserve CT Scanner
                      </button>
                    </div>

                    <div>
                      {isAcknowledged ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 text-white border border-red-500 font-bold text-xs">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Doctor Confirmed Ready
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => acknowledgePatientByDoctor(disp.id, currentDoctor.id)}
                          className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl text-xs shadow-lg shadow-red-950/60 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          Acknowledge & Confirm Ready
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
