import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalMap } from './HospitalMap';
import { EmergencyCondition } from '../types';

export const CustomerView: React.FC = () => {
  const { hospitals, doctors, dispatches, requestEmergencyPickup } = useHospital();

  const [citizenName, setCitizenName] = useState<string>('Muhammad Imran');
  const [contactNumber, setContactNumber] = useState<string>('0300-3456789');
  const [locationInSukkur, setLocationInSukkur] = useState<string>('Military Road, Near Sukkur Bypass');
  const [condition, setCondition] = useState<EmergencyCondition>('Cardiac Arrest / STEMI');
  const [notes, setNotes] = useState<string>('Severe acute crushing chest pain, profuse sweating, urgent ambulance requested.');
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [latestDispatchId, setLatestDispatchId] = useState<string>('');

  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDisp = requestEmergencyPickup({
      citizenName,
      contactNumber,
      locationInSukkur,
      condition,
      notes,
    });
    setLatestDispatchId(newDisp.id);
    setRequestSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-950 border border-red-600/40 rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-400 border border-red-800 uppercase tracking-wider">
              Sukkur Citizen Emergency Portal
            </span>
            <span className="text-xs text-zinc-400">24/7 Emergency Dispatch</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Emergency Hospital & Ambulance Guide
          </h2>
          <p className="text-xs text-zinc-300">
            Real-time bed, ICU, and doctor availability across River City Hospital Sukkur and regional emergency units
          </p>
        </div>

        {/* Quick Emergency Call Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="tel:1122"
            className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all active:scale-95 uppercase tracking-wider"
          >
            <span>📞</span>
            <span>Rescue 1122</span>
          </a>
          <a
            href="tel:115"
            className="bg-white hover:bg-zinc-200 text-black font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 uppercase tracking-wider"
          >
            <span>🚑</span>
            <span>Edhi 115</span>
          </a>
        </div>
      </div>

      {/* Immediate Request Form */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              Request Urgent Ambulance Pickup in Sukkur
            </h3>
            <p className="text-xs text-zinc-400">
              Submit your patient details to dispatch the nearest active ambulance and reserve an emergency room.
            </p>
          </div>
        </div>

        {requestSubmitted ? (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-red-600/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-lg font-black text-white">
              Emergency Ambulance Dispatched!
            </h4>
            <p className="text-xs text-zinc-300 max-w-md mx-auto">
              Sukkur emergency dispatch control has routed the response unit. River City Hospital Sukkur has been alerted and an emergency bay is reserved.
            </p>
            <div className="text-xs text-zinc-400 font-mono">
              Dispatch ID: <strong className="text-white">#{latestDispatchId}</strong> • Location: <strong className="text-red-400">{locationInSukkur}</strong>
            </div>
            <button
              onClick={() => setRequestSubmitted(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold border border-zinc-700 cursor-pointer"
            >
              Submit Another Emergency Request
            </button>
          </div>
        ) : (
          <form onSubmit={handlePickupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Patient or Caller Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Location in Sukkur</label>
                <input
                  type="text"
                  value={locationInSukkur}
                  onChange={(e) => setLocationInSukkur(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  placeholder="e.g. Military Road, Barrage Colony, Minara Road, Old Sukkur"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Emergency Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as EmergencyCondition)}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="Cardiac Arrest / STEMI">Cardiac Arrest / Severe Chest Pain (Heart Attack)</option>
                  <option value="Severe Trauma / Hemorrhage">Severe Highway Collision / Active Bleeding (Trauma)</option>
                  <option value="Acute Stroke / CVA">Acute Stroke / Sudden Paralysis</option>
                  <option value="Respiratory Failure / ARDS">Severe Respiratory Distress / Failing Airway</option>
                  <option value="Pediatric Severe Distress">Pediatric Emergency / High Distress</option>
                  <option value="General Critical">Other Critical Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold block mb-1">Symptoms / Notes for Paramedics</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                placeholder="Describe patient condition, landmark, or accessibility..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] uppercase tracking-wider"
            >
              <span>🚑 Request Rapid Ambulance Dispatch Now</span>
            </button>
          </form>
        )}
      </div>

      {/* Real-time Hospital Readiness in Sukkur */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            Sukkur Hospital Readiness & Live Assets
          </h3>
          <span className="text-xs text-zinc-500">24/7 Real-Time Synchronization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hospitals.map((hosp) => {
            const isRiverCity = hosp.name.includes('River City');
            const availableDocs = doctors.filter((d) => d.hospitalId === hosp.id && d.status === 'available');

            return (
              <div
                key={hosp.id}
                className={`bg-zinc-950 border rounded-2xl p-4 shadow-lg transition-all ${
                  isRiverCity ? 'border-red-600 ring-1 ring-red-600/40' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-sm">{hosp.name}</h4>
                      {isRiverCity && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-950 text-red-400 border border-red-800 uppercase">
                          Flagship Facility
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{hosp.address}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    hosp.divertStatus ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-zinc-900 text-white border border-zinc-700'
                  }`}>
                    {hosp.divertStatus ? 'Divert Active' : 'Open 24/7'}
                  </span>
                </div>

                {/* Capacity Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="bg-black p-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase">ICU Beds</span>
                    <span className={`font-bold ${hosp.assets.icuAvailable > 0 ? 'text-white' : 'text-red-500'}`}>
                      {hosp.assets.icuAvailable} Open
                    </span>
                  </div>
                  <div className="bg-black p-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase">Trauma Bays</span>
                    <span className="font-bold text-red-400">
                      {hosp.assets.traumaBaysAvailable} Ready
                    </span>
                  </div>
                  <div className="bg-black p-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase">Total Free</span>
                    <span className="font-bold text-white">
                      {hosp.assets.availableBeds} Beds
                    </span>
                  </div>
                </div>

                {/* On-Duty Doctor */}
                <div className="text-xs text-zinc-300 flex items-center justify-between pt-1">
                  <span>Specialist On Duty:</span>
                  <span className="font-bold text-white">
                    {availableDocs.length > 0 ? availableDocs[0].name : 'Duty Medical Officer Available'}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 flex items-center justify-between pt-2 border-t border-zinc-800 mt-2">
                  <span>Direct Helpline:</span>
                  <a href={`tel:${hosp.contactNumber}`} className="font-mono text-red-400 font-bold hover:underline">
                    {hosp.contactNumber}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map of Sukkur Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            Sukkur Medical Facilities GIS Map
          </h3>
          <span className="text-xs text-zinc-500">River City Hospital Sukkur & Regional Emergency Network</span>
        </div>
        <HospitalMap
          hospitals={hospitals}
          dispatches={dispatches}
          heightClass="h-[360px]"
        />
      </div>
    </div>
  );
};
