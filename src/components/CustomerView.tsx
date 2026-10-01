import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalMap } from './HospitalMap';
import { HospitalLogoFrame } from './HospitalLogoFrame';
import { EmergencyCondition } from '../types';
import { 
  Phone, 
  Ambulance, 
  MapPin, 
  CheckCircle2, 
  Bed, 
  Activity, 
  Clock,
  Layers,
  ShieldAlert
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { 
    hospitals, 
    doctors, 
    dispatches, 
    requestEmergencyPickup, 
    playClickTone,
    activeSection,
    setActiveSection 
  } = useHospital();

  const [citizenName, setCitizenName] = useState<string>('Muhammad Imran');
  const [contactNumber, setContactNumber] = useState<string>('0300-3456789');
  const [locationInSukkur, setLocationInSukkur] = useState<string>('Military Road, Near Sukkur Bypass');
  const [condition, setCondition] = useState<EmergencyCondition>('Cardiac Arrest / STEMI');
  const [notes, setNotes] = useState<string>('Crushing chest pain, profuse sweating, urgent ambulance requested.');
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [latestDispatchId, setLatestDispatchId] = useState<string>('');

  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickTone();
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

  const shouldShow = (sectionKey: string) => {
    return activeSection === 'all' || activeSection === sectionKey;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
      {/* Top Banner with Direct Emergency Call Buttons */}
      <div className="bg-zinc-950 border border-red-600/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4 neon-card-glow">
        <div className="flex items-center gap-3.5">
          <HospitalLogoFrame size="md" withGlow={true} />
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-zinc-400">
              <span className="font-bold text-white uppercase tracking-wider">Citizen Emergency Portal</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono">Sukkur 24/7 Rapid Service</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              Emergency Hospital & Ambulance Guide
            </h2>
            <p className="text-xs text-zinc-300">
              Live ICU, trauma bay, and specialist availability across River City Hospital Sukkur
            </p>
          </div>
        </div>

        {/* Quick Emergency Call Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeSection !== 'all' && (
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setActiveSection('all');
              }}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>All</span>
            </button>
          )}

          <a
            href="tel:1122"
            onClick={playClickTone}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.7)] transition-all active:scale-95 uppercase tracking-wider btn-neon-red"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Rescue 1122</span>
          </a>
          <a
            href="tel:115"
            onClick={playClickTone}
            className="flex-1 sm:flex-none bg-white hover:bg-zinc-200 text-black font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 uppercase tracking-wider btn-neon-white"
          >
            <Ambulance className="w-3.5 h-3.5" />
            <span>Edhi 115</span>
          </a>
        </div>
      </div>

      {/* SECTION 1: Immediate Ambulance Request Form */}
      {shouldShow('request') && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Request Urgent Ambulance Pickup in Sukkur</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Submit patient details to dispatch the nearest active ambulance and reserve an emergency room.
              </p>
            </div>
          </div>

          {requestSubmitted ? (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-red-600/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white">
                Emergency Ambulance Dispatched!
              </h4>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                Sukkur emergency dispatch control has routed the response unit. River City Hospital Sukkur has been alerted and an emergency bay is reserved.
              </p>
              <div className="text-xs text-zinc-400 font-mono">
                Dispatch ID: <strong className="text-white">#{latestDispatchId}</strong> · Location: <strong className="text-red-400">{locationInSukkur}</strong>
              </div>
              <button
                onClick={() => {
                  playClickTone();
                  setRequestSubmitted(false);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold border border-zinc-700 cursor-pointer transition-all hover:border-red-500"
              >
                Submit Another Emergency Request
              </button>
            </div>
          ) : (
            <form onSubmit={handlePickupSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Patient or Caller Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500"
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
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Military Road, Barrage Colony, Minara Road"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold block mb-1">Emergency Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as EmergencyCondition)}
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
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
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="Describe patient condition, landmark, or accessibility..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.7)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] uppercase tracking-wider btn-neon-red border border-red-400"
              >
                <Ambulance className="w-4 h-4" />
                <span>Request Rapid Ambulance Dispatch Now</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* SECTION 2: Sukkur Hospital Readiness & Live Assets */}
      {shouldShow('readiness') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Sukkur Hospital Readiness & Live Assets</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">24/7 Live Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {hospitals.map((hosp) => {
              const isRiverCity = hosp.name.includes('River City');
              const availableDocs = doctors.filter((d) => d.hospitalId === hosp.id && d.status === 'available');

              return (
                <div
                  key={hosp.id}
                  className={`bg-zinc-950 border rounded-2xl p-4 shadow-lg transition-all ${
                    isRiverCity ? 'border-red-600 ring-1 ring-red-600/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm">{hosp.name}</h4>
                        {isRiverCity && (
                          <span className="text-[9px] font-mono text-red-400 border border-red-900 bg-red-950 px-1 py-0.2 rounded uppercase">
                            Flagship
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

                  {/* Capacity Summary */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-400 block uppercase">ICU Beds</span>
                      <span className={`font-bold ${hosp.assets.icuAvailable > 0 ? 'text-white' : 'text-red-500'}`}>
                        {hosp.assets.icuAvailable} Open
                      </span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-400 block uppercase">Trauma Bays</span>
                      <span className="font-bold text-red-400">
                        {hosp.assets.traumaBaysAvailable} Ready
                      </span>
                    </div>
                    <div className="bg-black p-2 rounded-xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-400 block uppercase">Total Free</span>
                      <span className="font-bold text-white">
                        {hosp.assets.availableBeds} Beds
                      </span>
                    </div>
                  </div>

                  {/* On-Duty Doctor */}
                  <div className="text-xs text-zinc-300 flex items-center justify-between pt-1">
                    <span>Specialist On Duty:</span>
                    <span className="font-bold text-white truncate max-w-[180px]">
                      {availableDocs.length > 0 ? availableDocs[0].name.split(',')[0] : 'Duty Staff Available'}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center justify-between pt-2 border-t border-zinc-800 mt-2">
                    <span>Direct Helpline:</span>
                    <a 
                      href={`tel:${hosp.contactNumber}`} 
                      onClick={playClickTone}
                      className="font-mono text-red-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{hosp.contactNumber}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: Facilities GIS Map */}
      {shouldShow('map') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Sukkur Medical Facilities GIS Map</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">River City Hospital Sukkur Network</span>
          </div>
          <HospitalMap
            hospitals={hospitals}
            dispatches={dispatches}
            heightClass="h-[340px] sm:h-[400px]"
          />
        </div>
      )}

      {/* SECTION 4: Hotlines Card */}
      {shouldShow('hotlines') && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Phone className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wider">
              Sukkur Emergency Dialing Hotlines
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:1122"
              onClick={playClickTone}
              className="bg-red-950/60 hover:bg-red-900 border border-red-800 p-4 rounded-2xl flex items-center justify-between transition-all group"
            >
              <div>
                <span className="text-xs text-red-300 font-bold block">Sindh Emergency Rescue</span>
                <span className="text-xl font-black text-white font-mono">Dial 1122</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <Phone className="w-5 h-5" />
              </div>
            </a>

            <a
              href="tel:115"
              onClick={playClickTone}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-4 rounded-2xl flex items-center justify-between transition-all group"
            >
              <div>
                <span className="text-xs text-zinc-400 font-bold block">Edhi Ambulance Emergency</span>
                <span className="text-xl font-black text-white font-mono">Dial 115</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <Phone className="w-5 h-5" />
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
