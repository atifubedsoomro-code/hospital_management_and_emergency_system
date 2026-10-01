import { Hospital, Doctor, RoomType, Specialty, AlgorithmHospitalScore } from '../types';

// Calculate Haversine distance in kilometers between two GPS coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Estimate emergency transit ETA in minutes based on distance & urban emergency traffic
export function estimateEmergencyEta(distanceKm: number): number {
  // Average emergency response speed: ~45 km/h in urban + 1.5 min dispatch delay
  const speedKmH = 45;
  const transitTimeMinutes = (distanceKm / speedKmH) * 60;
  return Math.max(2, Math.round(transitTimeMinutes + 1.5));
}

// Check room capacity for the patient's requirement
export function checkRoomAvailability(hospital: Hospital, roomType: RoomType): { available: boolean; count: number } {
  if (hospital.divertStatus) {
    return { available: false, count: 0 };
  }

  switch (roomType) {
    case 'ICU':
      return {
        available: hospital.assets.icuAvailable > 0,
        count: hospital.assets.icuAvailable,
      };
    case 'Trauma Bay':
      return {
        available: hospital.assets.traumaBaysAvailable > 0,
        count: hospital.assets.traumaBaysAvailable,
      };
    case 'Cath Lab':
      return {
        available: hospital.assets.cathLabAvailable,
        count: hospital.assets.cathLabAvailable ? 1 : 0,
      };
    case 'Operating Theater':
    case 'General ER':
    case 'Isolation':
    default:
      return {
        available: hospital.assets.availableBeds > 0,
        count: hospital.assets.availableBeds,
      };
  }
}

// Find on-duty, available doctors matching the needed specialty
export function getAvailableSpecialists(doctors: Doctor[], hospitalId: string, neededSpecialty: Specialty): Doctor[] {
  return doctors.filter(
    (doc) =>
      doc.hospitalId === hospitalId &&
      doc.specialty === neededSpecialty &&
      (doc.status === 'available' || doc.status === 'emergency_call')
  );
}

// Comprehensive Hospital Matching Algorithm
export function evaluateHospitals(
  ambulanceLat: number,
  ambulanceLng: number,
  requiredRoom: RoomType,
  requiredSpecialty: Specialty,
  hospitals: Hospital[],
  doctors: Doctor[]
): AlgorithmHospitalScore[] {
  const scoredHospitals: AlgorithmHospitalScore[] = hospitals.map((hospital) => {
    const distanceKm = calculateDistanceKm(ambulanceLat, ambulanceLng, hospital.latitude, hospital.longitude);
    const etaMinutes = estimateEmergencyEta(distanceKm);

    const roomCheck = checkRoomAvailability(hospital, requiredRoom);
    const availableDocs = getAvailableSpecialists(doctors, hospital.id, requiredSpecialty);
    const hasSpecialist = availableDocs.length > 0;

    // Strict eligibility check
    let isEligible = true;
    if (hospital.divertStatus) isEligible = false;
    if (!roomCheck.available) isEligible = false;

    // Component scores (0-100 each)
    // 1. Proximity score: 100 for <= 2km, dropping to 0 at >= 25km
    const proximityScore = Math.max(0, Math.min(100, 100 - (distanceKm / 20) * 85));

    // 2. Room capacity score
    let roomScore = 0;
    if (roomCheck.available) {
      roomScore = Math.min(100, 60 + roomCheck.count * 10);
    }

    // 3. Doctor readiness score
    let docScore = 0;
    if (hasSpecialist) {
      docScore = 100;
    } else {
      // Check if hospital at least has any available ER doctor
      const generalERDocs = doctors.filter(
        (doc) => doc.hospitalId === hospital.id && doc.status === 'available'
      );
      if (generalERDocs.length > 0) {
        docScore = 40; // Partial score
      } else {
        docScore = 10;
      }
    }

    // Weighted Total Score
    // Weightings: Distance (40%), Room (35%), Doctor (25%)
    let totalScore = Math.round(
      proximityScore * 0.40 + roomScore * 0.35 + docScore * 0.25
    );

    if (hospital.divertStatus) {
      totalScore = Math.max(5, totalScore - 50);
    }

    // Generate clinical recommendation explanation
    let reason = '';
    if (hospital.divertStatus) {
      reason = 'DIVERSION ACTIVE: Hospital at maximum capacity; emergency bypass advised.';
    } else if (!roomCheck.available && !hasSpecialist) {
      reason = `Critical shortage: No ${requiredRoom} available and no on-duty ${requiredSpecialty}.`;
    } else if (!roomCheck.available) {
      reason = `No ${requiredRoom} beds available (${hospital.assets.availableBeds} general beds open).`;
    } else if (!hasSpecialist) {
      reason = `Bed available (${roomCheck.count} ${requiredRoom}), but ${requiredSpecialty} on-call doctor unavailable.`;
    } else {
      reason = `Optimal Match: ${distanceKm}km (${etaMinutes} min) with ${roomCheck.count} ${requiredRoom} open & Dr. ${availableDocs[0].name.replace(/^Dr\.\s*/, '')} on standby.`;
    }

    return {
      hospital,
      score: totalScore,
      distanceKm,
      etaMinutes,
      roomAvailable: roomCheck.available,
      availableRoomCount: roomCheck.count,
      availableDoctors: availableDocs,
      hasSpecialist,
      recommendationReason: reason,
      isEligible,
    };
  });

  // Sort descending by score
  return scoredHospitals.sort((a, b) => b.score - a.score);
}

// Generate intermediate waypoints for Leaflet polyline display simulating road curves
export function generateRoutePoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): [number, number][] {
  const points: [number, number][] = [[startLat, startLng]];
  const segments = 6;
  
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    // Interp with slight city-grid zigzag
    let lat = startLat + (endLat - startLat) * t;
    let lng = startLng + (endLng - startLng) * t;

    // Small offset for realistic road deviation
    const offset = Math.sin(t * Math.PI) * 0.003 * (i % 2 === 0 ? 1 : -1);
    lat += offset;
    lng += offset * 0.7;

    points.push([lat, lng]);
  }

  points.push([endLat, endLng]);
  return points;
}
